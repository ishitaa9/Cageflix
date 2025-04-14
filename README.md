Welcome to CageFlix — a Netflix-style movie library dedicated entirely to the Nicolas Cage.

Prerequisits
- Install Python
- Install Pandas Library : pip install pandas
- Activate the virtual environment

Data Extraction
- Download and extract IMDb Datasets (https://developer.imdb.com/non-commercial-datasets/)
  - title.basics.tsv
  - title.principals.tsv
  - title.episode.tsv
  - name.basics.tsv
  - title.ratings.tsv
- Add these files to the data-script folder.
- Run the python script (python data-script/extract_cage_movies.py) to generate the formatted (JSON) data.
- The extracted data will be stored in a public folder located in the main directory.

Features
- Browse through a library of Nicolas Cage's movies and series.
- Filter and view details from real IMDb data.
- Built with pure HTML, CSS, and JavaScript.
- Backend data wrangling done in Python using pandas.
- Movies are displayed dynamically and with responsive styling.
- Fuzzy search using title and genre.

Tech Stack
- Frontend:
    - HTML
    - CSS 
    - JavaScript

- Backend / Data Prep:
    - Python
    - Pandas
    - IMDb Datasets

 - I used HTML because it's the foundation of any web page. HTML structures the content on the page in a simple yet efficient way. 
 - I used CSS Grid and Flex layout for responsive designe, soo the website can be viewed on different devices, making it visually appealing and user-friendly.
 - I used JavaScript to bring the page to life. It is lightweight but allows the data to be loaded dynamically, filter them, and update the page without needing to reload. It's essential for adding interactivity for the user.
 - I used Python for data processing because it’s easy to read and powerful. It allows to work with large datasets and perform tasks like filtering movies by Nicolas Cage quickly and efficiently.
 - I used Pandas Library in pythoon because it is designed for working with structured data. I used it to manipulate the IMDb data, filter and clean it easily.
  
