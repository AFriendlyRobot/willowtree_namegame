// Create a game object to bundle relevant values
//     (avoid cluttering global scope)
var GameCreator = (people) => {
	// Constant values
	const HEADSHOT_SIZE = 170;

	// Initial conditions
	let numCorrect = 0;
	let numWrong = 0;
	let inputDisabled = false;
	let fallback = null;
	let matpeople = null;
	let mpeople = null;
	let allpeople = null;
	let mode = 'standard';
	let clicked = [false, false, false, false, false];
	let secondsLeft = 60;
	let timerInterval = null;

	/********************************
	 *	    Internal methods        *
	 ********************************/
	
	// Style selected game mode's button as selected
	let highlightButton = (id) => {
		$(id).addClass('btn-primary');
		$(id).removeClass('btn-secondary');
	}

	// Style selected game mode's button as not selected
	let unhighlightButton = (id) => {
		$(id).addClass('btn-secondary');
		$(id).removeClass('btn-primary');
	};

	// Given a mode (e.g. 'time' or 'mat'), register click
	//    event handler on the appropriate button
	let createModeButtonListener = (modeName) => {
		let tag = '#btn-game-' + modeName;
		$(tag).on('click', (event) => {
			event.preventDefault();
			event.stopPropagation();

			if (mode !== modeName) {
				mode = modeName;
				unhighlightButton('#btn-game-standard');
				unhighlightButton('#btn-game-mat');
				unhighlightButton('#btn-game-m');
				unhighlightButton('#btn-game-time');

				highlightButton(tag);

				resetScore();
				newRound();
			}
		});
	};

	// Simple combination of first and last names
	let buildName = (person) => {
		return person.firstName + ' ' + person.lastName;
	};

	// Creates a headshot image and relevant supporting material:
	// * Headshot img tag
	// * Overlay for correct/incorrect clicks
	// * Click event listener
	// * Wrapper div (including border on hover)
	let appendHeadshot = (parent, person, fallback, isTarget, position) => {
		let hsInfo = person.headshot;
		let oHeight = hsInfo.height;
		let oWidth = hsInfo.width;
		let hgt, wdt, topMargin;

		// Calculate scale factor needed to fit into a 170 x 170 box
		if (!oHeight || !oWidth || (oHeight === oWidth)) {
			hgt = HEADSHOT_SIZE;
			wdt = HEADSHOT_SIZE;
		} else if (oHeight > oWidth) {
			let factor = HEADSHOT_SIZE / oHeight;
			hgt = oHeight * factor;
			wdt = oWidth * factor;
		} else if (oHeight < oWidth) {
			let factor = HEADSHOT_SIZE / oWidth;
			hgt = oHeight * factor;
			wdt = oWidth * factor;
			topMargin = (HEADSHOT_SIZE - hgt) / 2;
		}

		// Either use fallback or provided person object to generate personal + img information
		let src = hsInfo.url || fallback.headshot.url;
		let alt = hsInfo.alt || fallback.headshot.alt;
		let id = hsInfo.id || fallback.headshot.id;
		let fname = person.firstName || fallback.firstName;
		let lname = person.lastName || fallback.lastName;

		// Store name as data for later access
		let data = fname + ' ' + lname;

		// Create img tag
		let imgStr = '<img class="namegame-headshot" src="' + src + '"';
		imgStr += 'alt="' + alt + '"';
		imgStr += 'id="' + id + '"';
		imgStr += 'height="' + hgt + '"';
		imgStr += 'width="' + wdt + '"';
		imgStr += 'data="' + data + '"';

		// If the original image is wider than it is tall,
		//     add a manual offset to vertically center it
		if (topMargin) {
			imgStr += 'style="margin-top:' + topMargin + 'px"';
		}

		imgStr += '>';

		// Create wrapper div
		let wrapper = $('<div class="headshot-wrapper" id="wrapper-' + id + '">');

		// Add overlay to wrapper div (corresponding to correct/incorrect clicks)
		let overlayClass = isTarget ? 'correct' : 'incorrect';
		let overlay = $('<div class="overlay shrunk ' + overlayClass + '" id="overlay-' + id + '">')
		$(overlay).append($('<text>' + data + '</text>'));

		let img = $(imgStr);
		$(parent).append(wrapper);
		$(wrapper).append(overlay);
		$(wrapper).append(img);

		// Used to track whether an image has already been clicked (preventing double scoring)
		$(wrapper).data('position', position);

		// Add event listener to the wrapper div
		// Determines correctness of click and handles score/timing updates when relevant
		$(wrapper).on('click', (event) => {
			event.preventDefault();
			event.stopPropagation();

			// Check that the game is currently accepting clicks and
			//    the current image has not yet been clicked
			if (inputDisabled) { return; }
			if (clicked[$(wrapper).data('position')]) { return; }

			clicked[$(wrapper).data('position')] = true;

			$(overlay).removeClass('shrunk');

			if (isTarget) {
				targetFound();
			} else {
				incorrectClicked();
			}
		});

		return (data !== 'WillowTree Staff') ? data : null;
	};

	// Handle a correct click on a headshot wrapper div
	let targetFound = () => {
		inputDisabled = true;
		numCorrect += 1;

		writeScore();

		$("#target-header").text("Great job!");

		// Add time for correct clicks
		if (mode === 'time') {
			flashTimer(true);
			secondsLeft += 2;
			drawTimer();
		}

		// Pause before starting the next round
		setTimeout(() => newRound(), 1000);
	};

	// Handle an incorrect click on a headshot wrapper div
	let incorrectClicked = () => {
		numWrong += 1;
		writeScore();

		// Remove time for incorrect clicks
		if (mode === 'time') {
			flashTimer(false);
			secondsLeft -= 2;
			drawTimer();
		}
	};

	// Flash a color (green or red) for the timer text, indicating + or - time
	let flashTimer = (wasCorrect) => {
		$('#timer-text').addClass((wasCorrect) ? 'timer-correct' : 'timer-incorrect');
		
		setTimeout(() => {
			$('#timer-text').removeClass('timer-correct');
			$('#timer-text').removeClass('timer-incorrect');
		}, 500);
	};

	// Draw the score
	let writeScore = () => {
		// Only write incorrect score if not in timed mode
		if (mode === 'time') {
			let correctText = $('#correct-text');
			correctText.text(`Correct: ${numCorrect}`);

			$('#wrong-text').addClass('hidden');
		} else {
			let correctText = $('#correct-text');
			correctText.text(`Correct: ${numCorrect}`);

			let wrongText = $('#wrong-text');
			$('#wrong-text').removeClass('hidden');
			wrongText.text(`Incorrect: ${numWrong}`);
		}
	};

	// Remove the timer tick interval and hide timer text
	let clearTimer = () => {
		$('#timer-text').addClass('hidden');
		clearInterval(timerInterval);
	};

	// Add an interval callback decrementing the timer and updating time remaining
	let startTimer = () => {
		secondsLeft = 60;

		$('#timer-text').removeClass('hidden');
		drawTimer();

		timerInterval = setInterval(() => {
			secondsLeft -= 1;
			drawTimer();

			if (secondsLeft <= 0) {
				// NOTE: Possible to skip 0 by selecting an incorrect headshot at 1s remaining
				endTimedSession();
			}
		}, 1000);
	};

	// End the timer and stop accepting input (on timed round end)
	let endTimedSession = () => {
		if (secondsLeft <= 0) {
			clearTimer();
			inputDisabled = true;
			$('#target-header').text('Finished!');
		}
	}

	// Write out the time, in minutes and seconds
	let drawTimer = () => {
		if (secondsLeft <= 0) {
			endTimedSession();
		}

		let secs = Math.max(secondsLeft % 60, 0);
		let mins = Math.max(Math.floor(secondsLeft / 60), 0);

		if (secondsLeft > 0) {
			$('#timer-text').text(`${mins}:${secs > 9 ? secs : '0' + secs}`);
		} else {
			$('#timer-text').text('0:00');
		}
	};

	// Used to select random names and generate the appropriate headshots
	let generateRandomHeadshots = (parent, numHeadshots) => {
		let fullgruop;

		// Depending on mode, use a subset of all people available
		if (mode === 'mat') {
			fullgroup = matpeople;
		} else if (mode === 'm') {
			fullgroup = mpeople;
		} else {
			fullgroup = allpeople; // Excludes fallback
		}

		// Select 5 random people
		let chosen = fullgroup.slice().sort(() => 0.5 - Math.random()).slice(0, numHeadshots);

		// Select one of the chosen 5 people as a 'target'
		let target = buildName(chosen[Math.floor(Math.random() * chosen.length)]);

		// Generate headshots and append
		for (let i = 0; i < chosen.length; i++) {
			let person = chosen[i];
			appendHeadshot(parent, person, fallback, buildName(person) === target, i);
		}

		return target;
	};

	// Reset score values, write them, and clear the timer (reset back to initial state)
	let resetScore = () => {
		numCorrect = 0;
		numWrong = 0;
		writeScore();

		clearTimer();

		if (mode === 'time') {
			startTimer();
		}
	};

	// Clear old headshots and generate new headshots
	// Does not reset score or timer
	// Behavior varies with mode
	let newRound = () => {
		let parent = $('#headshot-container');
		parent.empty(); // Clear old headshots

		let target = generateRandomHeadshots(parent, 5);

		// Conditional formatting of the target name
		if (mode === 'mat') {
			target = 'Mat(' + target.slice(3) + ')';
		} else if (mode === 'm') {
			target = 'M(' + target.slice(1) + ')';
		}

		// Reset clicked statuses and enable input
		$("#target-header").text('Find ' + target);
		clicked = [false, false, false, false, false];
		inputDisabled = false;
	};

	/****************************
	 *     External Methods     *
	 ****************************/

	// Initialize game and graphics, adding event listeners
	let start = () => {
		// Reveal the game
		$(".initial-hidden").removeClass('initial-hidden');

		// Use provided 'people' to calculate 'mat*' and 'm*' subsets
		// Default to the WillowTree logo and name
		fallback = people.filter((person) => person.firstName === 'WillowTree')[0];
		matpeople = people.filter((person) => person.firstName.startsWith('Mat'));
		mpeople = people.filter((person) => person.firstName.startsWith('M'));
		allpeople = people.filter((person) => person.firstName !== 'WillowTree');

		// Click event handlers for all game mode buttons
		createModeButtonListener('standard');
		createModeButtonListener('mat');
		createModeButtonListener('m');
		createModeButtonListener('time');

		newRound();
	};

	return { start };
}

// Fetch people from server, triggering callback
function fetchNames(success) {
	$.ajax({
	    url: 'https://willowtreeapps.com/api/v1.0/profiles/',
	    success: success,
	});
}

// On load, fetch people from server and use them to start a new game
$(window).on('load', function() {
	fetchNames((people) => {
		let game = GameCreator(people);
		game.start();
	});
});
