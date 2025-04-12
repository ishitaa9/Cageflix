import pandas as pd
import json
import os

chunk_size = 50000

# 1. Load name.basics to find Nicolas Cage's nconst
print("Loading name.basics.tsv...")
names_df = pd.read_csv('data-script/name.basics.tsv', sep='\t', dtype=str, na_values='\\N')
cage_row = names_df[names_df['primaryName'] == 'Nicolas Cage'].iloc[0]
cage_id = cage_row['nconst']

# 2. Load title.principals.tsv in chunks to find Cage's tconsts
print("Loading title.principals.tsv in chunks...")
cage_titles = set()
for chunk in pd.read_csv('data-script/title.principals.tsv', sep='\t', dtype=str, na_values='\\N', chunksize=chunk_size):
    mask = chunk['nconst'] == cage_id
    cage_titles.update(chunk[mask]['tconst'].dropna().unique())
cage_titles = list(cage_titles)

# 3. Load title.basics.tsv in chunks and filter to Cage’s titles
print("Loading title.basics.tsv in chunks...")
basics_filtered = []
for chunk in pd.read_csv('data-script/title.basics.tsv', sep='\t', dtype=str, na_values='\\N', chunksize=chunk_size):
    filtered = chunk[chunk['tconst'].isin(cage_titles)]
    basics_filtered.append(filtered)
basics_df = pd.concat(basics_filtered, ignore_index=True)

# Keep only movies and TV series
cage_title_df = basics_df[basics_df['titleType'].isin(['movie', 'tvSeries'])]

# 4. Load ratings
print("Loading title.ratings.tsv...")
ratings_df = pd.read_csv('data-script/title.ratings.tsv', sep='\t', dtype=str, na_values='\\N')
ratings_df[['averageRating', 'numVotes']] = ratings_df[['averageRating', 'numVotes']].apply(pd.to_numeric, errors='coerce')
cage_title_df = cage_title_df.merge(ratings_df, on='tconst', how='left')

# 5. Clean and convert types
cage_title_df['isAdult'] = cage_title_df['isAdult'].fillna('0').astype(int)
cage_title_df['startYear'] = pd.to_numeric(cage_title_df['startYear'], errors='coerce')
cage_title_df['endYear'] = pd.to_numeric(cage_title_df['endYear'], errors='coerce')
cage_title_df['runtimeMinutes'] = pd.to_numeric(cage_title_df['runtimeMinutes'], errors='coerce')
cage_title_df['averageRating'] = pd.to_numeric(cage_title_df['averageRating'], errors='coerce')
cage_title_df['numVotes'] = pd.to_numeric(cage_title_df['numVotes'], errors='coerce')

# 6. Format movie/series data into JSON
output = []
for _, row in cage_title_df.iterrows():
    output.append({
        "tconst": row["tconst"],
        "titleType": row["titleType"],
        "primaryTitle": row["primaryTitle"],
        "originalTitle": row["originalTitle"],
        "isAdult": bool(row["isAdult"]),
        "startYear": int(row["startYear"]) if pd.notna(row["startYear"]) else None,
        "endYear": int(row["endYear"]) if pd.notna(row["endYear"]) else None,
        "runtimeMinutes": int(row["runtimeMinutes"]) if pd.notna(row["runtimeMinutes"]) else None,
        "genres": row["genres"].split(",") if pd.notna(row["genres"]) else [],
        "averageRating": round(row["averageRating"], 1) if pd.notna(row["averageRating"]) else None,
        "numVotes": int(row["numVotes"]) if pd.notna(row["numVotes"]) else None
    })

# 6.1 Get all series IDs Nicolas Cage is part of
series_ids = cage_title_df[cage_title_df['titleType'] == 'tvSeries']['tconst'].unique()

# 6.2 Load episode data
print("Loading title.episode.tsv...")
episodes_df = pd.read_csv('data-script/title.episode.tsv', sep='\t', dtype=str, na_values='\\N')

# Filter episodes where parentTconst (series) is one of Cage's known series
episodes_in_series = episodes_df[episodes_df['parentTconst'].isin(series_ids)]

# 6.3 Cross-reference with principals to find Cage episodes (REUSE principals_df via chunking!)
print("Filtering episodes where Cage appears...")
cage_episode_ids = set()
for chunk in pd.read_csv('data-script/title.principals.tsv', sep='\t', dtype=str, na_values='\\N', chunksize=chunk_size):
    filtered = chunk[
        (chunk['nconst'] == cage_id) &
        (chunk['tconst'].isin(episodes_in_series['tconst']))
    ]
    cage_episode_ids.update(filtered['tconst'].dropna().unique())
cage_episode_ids = list(cage_episode_ids)

# 6.4 Get episode details
episode_details_df = basics_df[basics_df['tconst'].isin(cage_episode_ids)]
episode_details_df = episode_details_df.merge(ratings_df, on='tconst', how='left')

# Convert types
episode_details_df['isAdult'] = episode_details_df['isAdult'].fillna('0').astype(int)
episode_details_df['startYear'] = pd.to_numeric(episode_details_df['startYear'], errors='coerce')
episode_details_df['runtimeMinutes'] = pd.to_numeric(episode_details_df['runtimeMinutes'], errors='coerce')

# Add episode-specific fields
episode_details_df = episode_details_df.merge(
    episodes_df[['tconst', 'seasonNumber', 'episodeNumber', 'parentTconst']],
    on='tconst', how='left'
)

# 6.5 Format episode data
episode_output = []
for _, row in episode_details_df.iterrows():
    episode_output.append({
        "tconst": row["tconst"],
        "titleType": "tvepisode",
        "primaryTitle": row["primaryTitle"],
        "originalTitle": row["originalTitle"],
        "isAdult": bool(row["isAdult"]),
        "startYear": int(row["startYear"]) if pd.notna(row["startYear"]) else None,
        "runtimeMinutes": int(row["runtimeMinutes"]) if pd.notna(row["runtimeMinutes"]) else None,
        "genres": row["genres"].split(",") if pd.notna(row["genres"]) else [],
        "averageRating": round(row["averageRating"], 1) if pd.notna(row["averageRating"]) else None,
        "numVotes": int(row["numVotes"]) if pd.notna(row["numVotes"]) else None,
        "seasonNumber": int(row["seasonNumber"]) if pd.notna(row["seasonNumber"]) else None,
        "episodeNumber": int(row["episodeNumber"]) if pd.notna(row["episodeNumber"]) else None,
        "seriesId": row["parentTconst"]
    })

# 7. Append episodes to main output
output.extend(episode_output)

# 8. Save split outputs
movies_and_series = [item for item in output if item['titleType'] in ['movie', 'tvSeries']]
episodes = [item for item in output if item['titleType'] == 'tvepisode']

output_dir = './public'
os.makedirs(output_dir, exist_ok=True)

with open(os.path.join(output_dir, 'cage_movies_series.json'), 'w') as f:
    json.dump(movies_and_series, f, indent=4)

with open(os.path.join(output_dir, 'cage_episodes.json'), 'w') as f:
    json.dump(episodes, f, indent=4)
# 9. Report
print(f"✅ Saved {len(movies_and_series)} movies and series to 'cage_movies_series.json'")
print(f"✅ Saved {len(episodes)} TV episodes to 'cage_episodes.json'")
print(f"🎉 Total titles saved: {len(output)} (combined)")
