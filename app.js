fetch('public/cage_movies_series.json')
  .then(response => response.json())
  .then(data => {
    console.log('Loaded data:', data);

    // fuse.js for fuzzy search
    const fuseOptions = {
      keys: ['primaryTitle', 'genres'],
      threshold: 0.5,
      includeScore: true
    };

    const fuse = new Fuse(data, fuseOptions);

    // movie rendering
    function generateMovieItem(item) {
      const isTopRated = item.averageRating && item.averageRating >= 7;

      return `
        <div class="movie-list-item" data-id="${item.tconst}">
          <div class="movie-list-item-img-wrapper">
            <img class="movie-list-item-img" src="${item.imageUrl || 'default.jpg'}" alt="${item.primaryTitle || 'No title available'}">
            ${isTopRated ? '<span class="top-rated-badge">⭐ Top Rated</span>' : ''}
          </div>
          <span class="movie-list-item-title">${item.primaryTitle || 'No title available'}</span>
          <p class="movie-list-item-desc">
            ${item.genres?.join(', ') || 'Unknown'} | ${item.startYear || 'N/A'} | Rating: ${item.averageRating || 'N/A'}
          </p>
          <div class="movie-list-item-icons">
            <i class="fa-solid fa-circle-play fa-lg movie-list-play-btn"></i>
            <i class="fa-solid fa-heart fa-lg movie-list-favorite-btn"></i>
            <i class="fa-solid fa-circle-chevron-down fa-lg movie-list-showmore-btn"></i>
          </div>
        </div>
      `;
    }

    const newReleasesContainer = document.getElementById('new-releases');
    const popularContainer = document.getElementById('popular');
    const nextWatchContainer = document.getElementById('next-watch');
    const movieListContainers = document.querySelectorAll('.movie-list-container');
    const arrowIcons = document.querySelectorAll('.arrow');

    function populateContainer(container, data) {
      container.innerHTML = '';
      data.forEach(item => {
        if (item.titleType === 'movie') {
          container.innerHTML += generateMovieItem(item);
        }
      });
    }

    function scrollMovieList(container, direction) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }

    document.getElementById('new-releases-right-arrow').addEventListener('click', () => {
      scrollMovieList(document.getElementById('new-releases'), 'right');
    });

    document.getElementById('new-releases-left-arrow').addEventListener('click', () => {
      scrollMovieList(document.getElementById('new-releases'), 'left');
    });

    document.getElementById('popular-right-arrow').addEventListener('click', () => {
      scrollMovieList(document.getElementById('popular'), 'right');
    });

    document.getElementById('popular-left-arrow').addEventListener('click', () => {
      scrollMovieList(document.getElementById('popular'), 'left');
    });

    document.getElementById('next-watch-right-arrow').addEventListener('click', () => {
      scrollMovieList(document.getElementById('next-watch'), 'right');
    });

    document.getElementById('next-watch-left-arrow').addEventListener('click', () => {
      scrollMovieList(document.getElementById('next-watch'), 'left');
    });


    // search input field
    const searchInput = document.getElementById('search-input');
    const searchResultContainer = document.getElementById('search-results');

    searchInput.addEventListener('input', function() {
      const searchTerm = this.value.trim();

      if (searchTerm === '') {
        movieListContainers.forEach(container => container.style.display = 'block');
        arrowIcons.forEach(arrow => arrow.style.display = 'block');

        searchResultContainer.style.display = 'none';

        populateContainer(newReleasesContainer, data);
        populateContainer(popularContainer, data);
        populateContainer(nextWatchContainer, data);
      } else {
        movieListContainers.forEach(container => container.style.display = 'none');
        arrowIcons.forEach(arrow => arrow.style.display = 'none');

        const results = fuse.search(searchTerm);
        const filteredData = results.map(result => result.item);

        searchResultContainer.innerHTML = '';
        filteredData.forEach(item => {
          searchResultContainer.innerHTML += generateMovieItem(item);
        });

        searchResultContainer.style.display = 'block';
      }
    });

    populateContainer(newReleasesContainer, data);
    populateContainer(popularContainer, data);
    populateContainer(nextWatchContainer, data);

  })
  .catch(error => console.error('Error loading the data:', error));


