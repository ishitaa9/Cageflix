document.addEventListener('DOMContentLoaded', () => {
    fetch('public/cage_movies_series.json')
        .then(response => response.json())
        .then(data => {
            console.log('Loaded data:', data);

            // filter to only include series
            const series = data.filter(item => item.titleType === 'tvSeries');
            console.log('Filtered tvSeries:', series);

            // filter the series by genre
            const comedySeries = series.filter(seriesItem => seriesItem.genres && seriesItem.genres.includes('Comedy'));
            const documentarySeries = series.filter(seriesItem => seriesItem.genres && seriesItem.genres.includes('Documentary'));
            const otherSeries = series.filter(seriesItem => seriesItem.genres && !seriesItem.genres.includes('Comedy') && !seriesItem.genres.includes('Documentary'));

            console.log('Comedy Series:', comedySeries);
            console.log('Documentary Series:', documentarySeries);
            console.log('Other Series:', otherSeries);

            // generate series item html
            function generateSeriesItem(item) {
                const isTopRated = item.averageRating && item.averageRating >= 7;

                return `
                    <div class="movie-list-item">
                        <div class="movie-list-item-img-wrapper">
                            <img class="movie-list-item-img" src="${item.imageUrl || 'default.jpg'}" alt="${item.primaryTitle || 'No title available'}">
                            ${isTopRated ? '<span class="top-rated-badge">⭐ Top Rated</span>' : ''}
                        </div>
                        <span class="movie-list-item-title">${item.primaryTitle || 'No title available'}</span>
                        <p class="movie-list-item-desc">
                            ${item.genres?.join(', ') || 'Unknown Genre'} | ${item.startYear || 'Coming Soon'} | Rating: ${item.averageRating || 'N/A'}
                        </p>
                        <div class="movie-list-item-icons">
                            <i class="fa-solid fa-circle-play fa-lg movie-list-play-btn"></i>
                            <i class="fa-solid fa-heart fa-lg movie-list-favorite-btn"></i>
                            <i class="fa-solid fa-circle-chevron-down fa-lg movie-list-showmore-btn"></i>
                        </div>
                    </div>
                `;
            }

            function displaySeries(seriesList, containerId) {
                const container = document.getElementById(containerId);
                if (container) {
                    if (seriesList.length > 0) {
                        container.innerHTML = seriesList.map(item => generateSeriesItem(item)).join('');
                    } else {
                        container.innerHTML = `<p>No series available in this category.</p>`;
                    }
                } else {
                    console.error(`Element with ID "${containerId}" not found.`);
                }
            }

            displaySeries(comedySeries, 'comedy');
            displaySeries(documentarySeries, 'documentary');
            displaySeries(otherSeries, 'other');

            function scrollSeriesList(container, direction) {
                const scrollAmount = 300;
                container.scrollBy({
                    left: direction === 'right' ? scrollAmount : -scrollAmount,
                    behavior: 'smooth'
                });
            }

            document.getElementById('new-releases-right-arrow').addEventListener('click', () =>{
                scrollSeriesList(document.getElementById('comedy'), 'right')

            });
            document.getElementById('new-releases-left-arrow').addEventListener('click', () => {
                scrollSeriesList(document.getElementById('comedy'), 'left')
            });
            document.getElementById('popular-right-arrow').addEventListener('click', () => {
                scrollSeriesList(document.getElementById('documentary'), 'right')}
            );
            document.getElementById('popular-left-arrow').addEventListener('click', () => {
                scrollSeriesList(document.getElementById('documentary'), 'left')});
            document.getElementById('next-watch-right-arrow').addEventListener('click', () => scrollSeriesList(document.getElementById('other'), 'right'));
            document.getElementById('next-watch-left-arrow').addEventListener('click', () => scrollSeriesList(document.getElementById('other'), 'left'));

            // fuse.js for fuzzy searching
            const fuse = new Fuse(series, {
                keys: ['primaryTitle', 'genres'],
                threshold: 0.5,
            });

            const searchInput = document.getElementById('search-input');
            const searchResultsContainer = document.getElementById('search-results');

            searchInput.addEventListener('input', () => {
                const searchTerm = searchInput.value.trim();
                console.log('Search term:', searchTerm);

                const genreSections = document.querySelectorAll('.movie-list-container');
                if (searchTerm === '') {
                    console.log('Search term is empty, showing genre sections');
                    genreSections.forEach(section => section.style.display = 'block');
                    searchResultsContainer.style.display = 'none';
                    searchResultsContainer.innerHTML = '';
                    return;
                }

                genreSections.forEach(section => section.style.display = 'none');

                const results = fuse.search(searchTerm);
                console.log('Search results:', results);
                const filteredSeries = results.map(result => result.item);

                searchResultsContainer.innerHTML = filteredSeries.length
                    ? filteredSeries.map(generateSeriesItem).join('')
                    : '<p>No results found.</p>';

                searchResultsContainer.style.display = 'block';
            });

        })
        .catch(error => {
            console.error('Error loading series data:', error);
        });
});
