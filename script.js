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

const favorites = JSON.parse(sessionStorage.getItem('favoriteMovies')) ?? [];
let currentTab;

const initMovies = () => {
	setActiveTab(btnDiscover);
	btnClearSearch.classList.remove('active');
	fetch(`${baseURL}discover/movie?${auth}`)
		.then((response) => response.json())
		.then((data) => {
			populateMovies(data.results);
		})
		.catch((err) =>
			console.log(`Error when initializing discover tab: ${err}`)
		);
};
initMovies();

function populateMovies(movies) {
	discoverContainer.innerHTML = '';
	movies.forEach((movie) => {
		// console.log(movie);
		discoverContainer.innerHTML += `<div class="movie-box">
    <div class="thumbnail-container">
    <img src="https://image.tmdb.org/t/p/w300/${movie.backdrop_path}" />
    </div>
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
			})
			.catch((err) => console.log(`Error when searching: ${err}`));
		btnClearSearch.classList.add('active');
	} else {
		initMovies();
	}
}

function setFavorite() {
	const favoritedId = this.getAttribute('data-id');
	const byeGrandpa = () => {
		this.parentElement.parentElement.classList.add('fade-out');
		setTimeout(() => {
			this.parentElement.parentElement.remove();
		}, 500);
	};

	const attemptSetFavorite = new Promise((resolve, reject) => {
		if (this.checked) {
			fetch(`${baseURL}movie/${favoritedId}?${auth}`)
				.then((response) => response.json())
				.then((data) => {
					favorites.push(data);
					resolve('favorited');
				})
				.catch((err) => reject(`set favorite error: ${err}`));
			this.classList.add('green-flair');
			setTimeout(() => this.classList.remove('green-flair'), 500);
		} else {
			try {
				favorites.splice(
					favorites.findIndex((movie) => movie.id == favoritedId),
					1
				);
				currentTab === 'Favorites' && byeGrandpa();
				resolve('unfavorited');
			} catch (err) {
				reject(`set unfavorite error: ${err}`);
			}
		}
	});

	attemptSetFavorite
		.then((message) => {
			console.log(favoritedId, message);
			this.classList.toggle('favorited');
			sessionStorage.setItem('favoriteMovies', JSON.stringify(favorites));
		})
		.catch((message) => {
			console.log(message);
		});
}

function setAlreadyFavorited(movieList) {
	try {
		favorites &&
			favorites.forEach((favorite) => {
				if (movieList.find((movie) => movie.id === favorite.id)) {
					const currentFavorite = document.querySelector(
						`.favorite-checkmark[data-id="${favorite.id}"]`
					);
					currentFavorite.checked = true;
					currentFavorite.classList.add('favorited');
				}
			});
	} catch (err) {
		console.log(`Error when setting already favorited: ${err}`);
	}
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
	currentTab = targetBtn.textContent;
}
