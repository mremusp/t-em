'use strict';
const auth = `api_key=${config.key}`;
const baseURL = 'https://api.themoviedb.org/3/';

console.clear();
const discoverContainer = document.querySelector('#discover-container');
const searchContainer = document.querySelector('.search--container');
const searchField = document.querySelector('#search-field');
const btnFavorites = document.querySelector('#btn-favorites');
const btnDiscover = document.querySelector('#btn-discover');
const btnClearSearch = document.querySelector('#clear-search');

// const genres = fetch(`${baseURL}genre/movie/list?${auth}`).then(
//   (response) => response.json()
// );

const favorites = [];
const toPush = new Set();

const initMovies = () => {
	setActiveTab(btnDiscover);
	btnClearSearch.classList.remove('active');
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
	if (searchStr) {
		fetch(`${baseURL}search/movie?${auth}&query=${searchStr}`)
			.then((response) => response.json())
			.then((data) => {
				console.log(data);
				populateMovies(data.results);
			});
		btnClearSearch.classList.add('active');
	} else {
		initMovies();
	}
}

function setFavorite() {
	if (this.checked) {
		// console.log(this);
		fetch(`${baseURL}movie/${this.getAttribute('data-id')}?${auth}`)
			.then((response) => response.json())
			.then((data) => {
				// console.log(data);
				favorites.push(data);
				// const { id, backdrop_path, original_title, release_date } = data;
				const { id, backdrop_path, original_title, release_date } = data;
				toPush.add({
					id,
					backdrop_path,
					original_title,
					release_date,
				});
				console.group('current favorites', toPush);
				favorites.forEach((favorite, index) =>
					console.log(`${index}: ${favorite.original_title}`)
				);
				console.groupEnd();
			});
		this.classList.add('green-flair');
		setTimeout(() => this.classList.remove('green-flair'), 500);
	} else {
		console.log('unselected item:', this.getAttribute('data-id'));
		console.log(
			'index found:',
			favorites.findIndex((movie) => movie.id == this.getAttribute('data-id'))
		);
		favorites.splice(
			favorites.findIndex((movie) => movie.id == this.getAttribute('data-id')),
			1
		);
		console.group('current favorites');
		favorites.forEach((favorite, index) =>
			console.log(`${index}: ${favorite.original_title}`)
		);
		console.groupEnd();
	}

	this.classList.toggle('favorited');
}

function setAlreadyFavorited(movieList) {
	favorites.forEach((favorite) => {
		if (movieList.find((movie) => movie.id === favorite.id)) {
			const currentFavorite = document.querySelector(
				`.favorite-checkmark[data-id="${favorite.id}"]`
			);
			currentFavorite.checked = true;
			currentFavorite.classList.add('favorited');
		}
	});
}

let debounceTimer;
const debounce = (cb, time) => {
	window.clearTimeout(debounceTimer);
	debounceTimer = window.setTimeout(cb, time);
};
searchField.addEventListener('input', () => debounce(searchMovie, 1000));
btnDiscover.addEventListener('click', () => {
	initMovies();
});

btnFavorites.addEventListener('click', () => {
	setActiveTab(btnFavorites);
	populateMovies(favorites);
});

searchField.addEventListener('focus', toggleSearchFocus);
searchField.addEventListener('blur', toggleSearchFocus);

function toggleSearchFocus() {
	searchContainer.classList.toggle('focused');
}

btnClearSearch.addEventListener('click', () => {
	searchField.value = '';
	initMovies();
});

function setActiveTab(targetBtn) {
	document.querySelector('.btn.active')?.classList.remove('active');
	targetBtn.classList.toggle('active');
}
