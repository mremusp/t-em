'use strict';
const auth = `api_key=${config.key}`;
const baseURL = 'https://api.themoviedb.org/3/';

console.clear();
const discoverContainer = document.querySelector(
  '#discover-container'
);
const searchField = document.querySelector('#search-field');
const searchButton = document.querySelector('#search-button');
const btnFavorites = document.querySelector('#btn-favorites');

// const genres = fetch(`${baseURL}genre/movie/list?${auth}`).then(
//   (response) => response.json()
// );

const favorites = [];

fetch(`${baseURL}discover/movie?${auth}`)
  .then((response) => response.json())
  .then((data) => {
    // console.log(data);
    populateMovies(data.results);
  });

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
        console.log(data);
        favorites.push(data);
      });
  } else {
    favorites.splice(
      favorites.findIndex(
        (movie) => movie.id === this.getAttribute('data-id')
      )
    );
  }
  console.log('array favorites', favorites);
}

searchButton.addEventListener('click', searchMovie);

btnFavorites.addEventListener('click', () =>
  populateMovies(favorites)
);
