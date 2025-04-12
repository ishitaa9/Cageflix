let movies = [];

document.addEventListener('DOMContentLoaded', () => {
    fetch('public/cage_movies_series.json')
        .then(response => response.json())
        .then(data => {
            console.log('Loaded data:', data);

            // filter data to only include movies
            movies = data.filter(item => item.titleType === 'movie');
            console.log('Movies:', movies);

            // filter the movies by genre
            const dramaMovies = movies.filter(movie => movie.genres && movie.genres.includes('Drama'));
            const crimeMovies = movies.filter(movie => movie.genres && movie.genres.includes('Crime'));
            const comedyMovies = movies.filter(movie => movie.genres && movie.genres.includes('Comedy'));

            console.log('Drama Movies:', dramaMovies);
            console.log('Crime Movies:', crimeMovies);
            console.log('Comedy Movies:', comedyMovies);

            // movie items for each category
            function generateMovieItem(item) {
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

            function displayMovies(movieList, containerId) {
                const container = document.getElementById(containerId);
                if (container) {
                    if (movieList.length > 0) {
                        container.innerHTML = movieList.map(movie => generateMovieItem(movie)).join('');
                    } else {
                        container.innerHTML = `<p>No movies available in this category.</p>`;
                    }
                } else {
                    console.error(`Element with ID "${containerId}" not found.`);
                }
            }

            displayMovies(dramaMovies, 'drama');
            displayMovies(crimeMovies, 'crime');
            displayMovies(comedyMovies, 'comedy');

            // scroll movie list
            function scrollMovieList(container, direction) {
                const scrollAmount = 300;
                container.scrollBy({
                    left: direction === 'right' ? scrollAmount : -scrollAmount,
                    behavior: 'smooth'
                });
            }

            document.getElementById('new-releases-right-arrow').addEventListener('click', () => {
                scrollMovieList(document.getElementById('drama'), 'right');
            });

            document.getElementById('new-releases-left-arrow').addEventListener('click', () => {
                scrollMovieList(document.getElementById('drama'), 'left');
            });

            document.getElementById('popular-right-arrow').addEventListener('click', () => {
                scrollMovieList(document.getElementById('crime'), 'right');
            });

            document.getElementById('popular-left-arrow').addEventListener('click', () => {
                scrollMovieList(document.getElementById('crime'), 'left');
            });

            document.getElementById('next-watch-right-arrow').addEventListener('click', () => {
                scrollMovieList(document.getElementById('comedy'), 'right');
            });

            document.getElementById('next-watch-left-arrow').addEventListener('click', () => {
                scrollMovieList(document.getElementById('comedy'), 'left');
            });

            // fuse.js initialisation
            const fuse = new Fuse(movies, {
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
                const filteredMovies = results.map(result => result.item);

                searchResultsContainer.innerHTML = filteredMovies.length
                    ? filteredMovies.map(generateMovieItem).join('')
                    : '<p>No results found.</p>';

                searchResultsContainer.style.display = 'block';
            });

        })
        .catch(error => {
            console.error('Error loading movie data:', error);
        });
});
