var GameCreator = (people) => {
	const HEADSHOT_SIZE = 170;

	let numCorrect = 0;
	let numWrong = 0;
	let inputDisabled = false;

	let fallback = null;

	let matpeople = null;

	let mode = 'standard';

	let clicked = [false, false, false, false, false];

	let secondsLeft = 10;
	let timerInterval = null;

	let highlightButton = (id) => {
		$(id).addClass('btn-primary');
		$(id).removeClass('btn-secondary');
	}

	let unhighlightButton = (id) => {
		$(id).addClass('btn-secondary');
		$(id).removeClass('btn-primary');
	}

	let start = () => {
		$(".initial-hidden").removeClass('initial-hidden');
		// $("#scoring").removeClass('hidden');

		fallback = people.filter((person) => person.firstName === 'WillowTree')[0];
		matpeople = people.filter((person) => person.firstName.startsWith('Mat'));
		mpeople = people.filter((person) => person.firstName.startsWith('M'));

		$('#btn-game-standard').on('click', (event) => {
			event.preventDefault();

			if (mode !== 'standard') {
				mode = 'standard';
				highlightButton('#btn-game-standard');
				unhighlightButton('#btn-game-mat');
				unhighlightButton('#btn-game-m');
				unhighlightButton('#btn-game-time');

				resetScore();
				newRound();
			}
		});

		$('#btn-game-mat').on('click', (event) => {
			event.preventDefault();

			if (mode !== 'mat') {
				mode = 'mat';
				highlightButton('#btn-game-mat');
				unhighlightButton('#btn-game-standard');
				unhighlightButton('#btn-game-m');
				unhighlightButton('#btn-game-time');

				resetScore();
				newRound();
			}
		});

		$('#btn-game-m').on('click', (event) => {
			event.preventDefault();

			if (mode !== 'm') {
				mode = 'm';
				highlightButton('#btn-game-m');
				unhighlightButton('#btn-game-standard');
				unhighlightButton('#btn-game-mat');
				unhighlightButton('#btn-game-time');

				resetScore();
				newRound();
			}
		});

		$('#btn-game-time').on('click', (event) => {
			event.preventDefault();

			if (mode !== 'time') {
				mode = 'time';
				highlightButton('#btn-game-time');
				unhighlightButton('#btn-game-standard');
				unhighlightButton('#btn-game-m');
				unhighlightButton('#btn-game-mat');

				resetScore();
				newRound();
			}
		});

		newRound();
	};

	let buildName = (person) => {
		return person.firstName + ' ' + person.lastName;
	};

	let appendHeadshot = (parent, person, fallback, isTarget, position) => {
		let hsInfo = person.headshot;
		let oHeight = hsInfo.height;
		let oWidth = hsInfo.width;
		let hgt, wdt, topMargin;

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

		let src = hsInfo.url || fallback.headshot.url;
		let alt = hsInfo.alt || fallback.headshot.alt;
		let id = hsInfo.id || fallback.headshot.id;

		let fname = person.firstName || fallback.firstName;
		let lname = person.lastName || fallback.lastName;

		let data = fname + ' ' + lname;

		let imgStr = '<img class="namegame-headshot" src="' + src + '"';
		imgStr += 'alt="' + alt + '"';
		imgStr += 'id="' + id + '"';
		imgStr += 'height="' + hgt + '"';
		imgStr += 'width="' + wdt + '"';
		imgStr += 'data="' + data + '"';

		if (topMargin) {
			imgStr += 'style="margin-top:' + topMargin + 'px"';
		}

		imgStr += '>';

		let wrapper = $('<div class="headshot-wrapper" id="wrapper-' + id + '">');

		let overlayClass = isTarget ? 'correct' : 'incorrect';
		let overlay = $('<div class="overlay shrunk ' + overlayClass + '" id="overlay-' + id + '">')
		$(overlay).append($('<text>' + data + '</text>'));

		let img = $(imgStr);
		$(parent).append(wrapper);
		$(wrapper).append(overlay);
		$(wrapper).append(img);

		$(wrapper).data('position', position);

		$(wrapper).on('click', (event) => {
			event.preventDefault();
			event.stopPropagation();

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

	let targetFound = () => {
		inputDisabled = true;
		numCorrect += 1;

		writeScore();

		$("#target-header").text("Great job!");

		if (mode === 'time') {
			flashTimer(true);
			secondsLeft += 2;
			drawTimer();
		}

		setTimeout(() => newRound(), 1000);
	};

	let incorrectClicked = () => {
		numWrong += 1;
		writeScore();

		if (mode === 'time') {
			flashTimer(false);
			secondsLeft -= 2;
			drawTimer();
		}
	};

	let flashTimer = (wasCorrect) => {
		$('#timer-text').addClass((wasCorrect) ? 'timer-correct' : 'timer-incorrect');
		
		setTimeout(() => {
			$('#timer-text').removeClass('timer-correct');
			$('#timer-text').removeClass('timer-incorrect');
		}, 500);
	};

	let writeScore = () => {
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

	let clearTimer = () => {
		$('#timer-text').addClass('hidden');
		clearInterval(timerInterval);
	};

	let startTimer = () => {
		secondsLeft = 10;

		$('#timer-text').removeClass('hidden');
		drawTimer();

		timerInterval = setInterval(() => {
			secondsLeft -= 1;
			drawTimer();

			if (secondsLeft <= 0) {
				// clearTimer();
				// inputDisabled = true;
				// $('#target-header').text('Finished!');
				endTimedSession();
			}
		}, 1000);
	};

	let endTimedSession = () => {
		if (secondsLeft <= 0) {
			clearTimer();
			inputDisabled = true;
			$('#target-header').text('Finished!');
		}
	}

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

	let generateRandomHeadshots = (parent, numHeadshots) => {
		// let parent = $('#headshot-container');
		// parent.empty();

		// let fallback = people.filter((person) => person.firstName === 'WillowTree')[0];

		// let fullgroup = (mode === 'mat') ? matpeople : people;
		let fullgruop;

		if (mode === 'mat') {
			fullgroup = matpeople;
		} else if (mode === 'm') {
			fullgroup = mpeople;
		} else {
			fullgroup = people;
		}

		let chosen = fullgroup.slice().sort(() => 0.5 - Math.random()).slice(0, numHeadshots);
		let names = [];

		let target = buildName(chosen[Math.floor(Math.random() * chosen.length)]);

		for (let i = 0; i < chosen.length; i++) {
			let person = chosen[i];

			names.push(appendHeadshot(parent, person, fallback, buildName(person) === target, i));
		}

		return target;
	};

	let resetScore = () => {
		numCorrect = 0;
		numWrong = 0;
		writeScore();

		clearTimer();

		if (mode === 'time') {
			startTimer();
		}
	};

	let newRound = () => {
		let parent = $('#headshot-container');
		parent.empty();

		let target = generateRandomHeadshots(parent, 5);

		// target = (mode === 'mat') ? 'Mat(' + target.slice(3) + ')' : target;

		if (mode === 'mat') {
			target = 'Mat(' + target.slice(3) + ')';
		} else if (mode === 'm') {
			target = 'M(' + target.slice(1) + ')';
		}

		$("#target-header").text('Find ' + target);
		clicked = [false, false, false, false, false];
		inputDisabled = false;
	};

	return { start, newRound };
}

function fetchNames(success) {
	$.ajax({
	    url: 'https://willowtreeapps.com/api/v1.0/profiles/',
	    success: success,
	});
}

$(window).on('load', function() {
	fetchNames((people) => {
		let game = GameCreator(people);
		game.start();
	});
});
