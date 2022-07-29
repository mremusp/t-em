'use strict';
const auth = `api_key=${config.key}`;
const baseURL = 'https://api.themoviedb.org/3/';

console.clear();
const discoverContainer = document.querySelector(
  '#discover-container'
);
const searchField = document.querySelector('#search-field');
const btnSearch = document.querySelector('#search-button');
const btnFavorites = document.querySelector('#btn-favorites');
const btnDiscover = document.querySelector('#btn-discover');

// const genres = fetch(`${baseURL}genre/movie/list?${auth}`).then(
//   (response) => response.json()
// );

const favorites = [];

const initMovies = () => {
  fetch(`${baseURL}discover/movie?${auth}`)
    .then((response) => response.json())
    .then((data) => {
      // console.log(data);
      populateMovies(data.results);
    });
};
initMovies();

function populateMovies(movies) {
  discoverContainer.innerHTML = '';
  movies.forEach((movie) => {
    // console.log(movie);
    discoverContainer.innerHTML += `<div class="movie-box">
    <img src="https://image.tmdb.org/t/p/w300/${movie.backdrop_path}" />
    <div class="movie-info">
    <p class="movie-info--title">${movie.original_title}</p>
    <p class="movie-info--release">${movie.release_date}</p>
    <p class="movie-info--genres"><span>genre</span><span>place</span><span>holder</span></p>
    <input type="checkbox" data-id=${movie.id} class="favorite-checkmark">
    </div>
    </div>`;
  });
  setAlreadyFavorited(movies);
  document
    .querySelectorAll('.favorite-checkmark')
    .forEach((favoriteCheckmark) => {
      favoriteCheckmark.addEventListener('change', setFavorite);
    });
}

function searchMovie() {
  const searchStr = encodeURI(searchField.value);
  console.log(searchStr);
  fetch(`${baseURL}search/movie?${auth}&query=${searchStr}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      populateMovies(data.results);
    });
}

function setFavorite() {
  if (this.checked) {
    // console.log(this);
    fetch(`${baseURL}movie/${this.getAttribute('data-id')}?${auth}`)
      .then((response) => response.json())
      .then((data) => {
        // console.log(data);
        favorites.push(data);
        console.group('current favorites');
        favorites.forEach((favorite, index) =>
          console.log(`${index}: ${favorite.original_title}`)
        );
        console.groupEnd();
      });
  } else {
    console.log('unselected item:', this.getAttribute('data-id'));
    console.log(
      'index found:',
      favorites.findIndex(
        (movie) => movie.id == this.getAttribute('data-id')
      )
    );
    favorites.splice(
      favorites.findIndex(
        (movie) => movie.id == this.getAttribute('data-id')
      ),
      1
    );
    console.group('current favorites');
    favorites.forEach((favorite, index) =>
      console.log(`${index}: ${favorite.original_title}`)
    );
    console.groupEnd();
  }
}

function setAlreadyFavorited(movieList) {
  favorites.forEach((favorite) => {
    if (movieList.find((movie) => movie.id === favorite.id)) {
      document.querySelector(
        `.favorite-checkmark[data-id="${favorite.id}"]`
      ).checked = true;
    }
  });
}

btnSearch.addEventListener('click', searchMovie);
btnDiscover.addEventListener('click', initMovies);

btnFavorites.addEventListener('click', () =>
  populateMovies(favorites)
);
