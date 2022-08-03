'use strict';
const apiKey = '<<key here>>';
// TMDB API key here ^^
const auth = `api_key=${typeof config != 'undefined' ? config.key : apiKey}`;
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
	/* initializing the "landing" screen */
	setActiveTab(btnDiscover);
	btnClearSearch.classList.remove('active');
	fetch(`${baseURL}discover/movie?${auth}`)
		.then((response) => response.json())
		.then((data) => {
			populateMovies(data.results);
		})
		.catch((err) => {
			handleEmptyScreen();
			console.log(`Error when initializing discover tab: ${err}`);
		});
};
initMovies();

const handleEmptyScreen = (screen = 'default') => {
	/* displaying a message when no movies are shown */
	const emptyScreenMsg = document.createElement('p');
	emptyScreenMsg.classList.add('empty-screen');
	const emptyMsg = {
		search: 'No results matched your search.',
		favorites: 'You have no favorites yet.',
		default: 'Something went wrong with the API call :(',
	};
	emptyScreenMsg.textContent = emptyMsg[screen];
	discoverContainer.append(emptyScreenMsg);
};

function populateMovies(movies, screen) {
	/* displaying the passed in array as a grid */
	discoverContainer.innerHTML = '';
	if (movies.length) {
		movies.forEach((movie) => {
			discoverContainer.innerHTML += `<div class="movie-box ">
    <div class="thumbnail-container ${!movie.backdrop_path ? 'default-img' : ''}">
    <img src="https://image.tmdb.org/t/p/w300/${movie.backdrop_path}"/>
    </div>
    <div class="movie-info">
    <p class="movie-info--title">${movie.original_title}</p>
    <p class="movie-info--release">${movie.release_date}</p>
    <input type="checkbox" data-id=${movie.id} class="favorite-checkmark">
    </div>
    </div>`;
		});
	} else {
		handleEmptyScreen(screen);
	}
	setAlreadyFavorited(movies);
	document.querySelectorAll('.favorite-checkmark').forEach((favoriteCheckmark) => {
		favoriteCheckmark.addEventListener('change', setFavorite);
	});
}

function searchMovie() {
	/* calling the "search" API endpoint with the value from the search field */
	const searchStr = encodeURI(searchField.value);
	if (searchStr) {
		fetch(`${baseURL}search/movie?${auth}&query=${searchStr}`)
			.then((response) => response.json())
			.then((data) => {
				console.log(data);
				populateMovies(data.results, 'search');
			})
			.catch((err) => {
				handleEmptyScreen();
				console.log(`Error when searching: ${err}`);
			});
		btnClearSearch.classList.add('active');
	} else {
		initMovies();
	}
}

function setFavorite() {
	const favoritedId = this.getAttribute('data-id');
	const byeGrandpa = () => {
		/* removing element from favorites screen when it is unfavorited */
		this.parentElement.parentElement.classList.add('fade-out');
		setTimeout(() => {
			this.parentElement.parentElement.remove();
		}, 500);
	};

	const attemptSetFavorite = new Promise((resolve, reject) => {
		/* adding movie details to the favorites array */
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

	attemptSetFavorite /* saving the favorites array to localStorage */
		.then((message) => {
			console.log(favoritedId, message);
			this.classList.toggle('favorited');
			localStorage.setItem('favoriteMovies', JSON.stringify(favorites));
		})
		.catch((message) => {
			console.log(`Error when saving to localStorage: ${message}`);
		});
}

function setAlreadyFavorited(movieList) {
	/* adding the 💚 to the movies from the favorites array */
	try {
		favorites &&
			favorites.forEach((favorite) => {
				if (movieList.find((movie) => movie.id === favorite.id)) {
					const currentFavorite = document.querySelector(`.favorite-checkmark[data-id="${favorite.id}"]`);
					currentFavorite.checked = true;
					currentFavorite.classList.add('favorited');
				}
			});
	} catch (err) {
		console.log(`Error when setting already favorited: ${err}`);
	}
}

let debounceTimer;
const debounce = (searchFn) => {
	/* calling the "search" endpoint after the user has stopped typing for 1 second */
	window.clearTimeout(debounceTimer);
	debounceTimer = window.setTimeout(searchFn, 1000);
};
searchField.addEventListener('input', () => debounce(searchMovie));

btnDiscover.addEventListener('click', () => {
	initMovies();
});
btnFavorites.addEventListener('click', () => {
	setActiveTab(btnFavorites);
	populateMovies(favorites, 'favorites');
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
