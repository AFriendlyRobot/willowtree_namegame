var GameCreator = (people) => {
	const HEADSHOT_SIZE = 170;

	let numCorrect = 0;
	let numWrong = 0;
	let inputDisabled = false;

	let fallback = null;

	let matpeople = null;

	let mode = 'standard';

	let clicked = [false, false, false, false, false];

	let start = () => {
		$(".initial-hidden").removeClass('initial-hidden');
		// $("#scoring").removeClass('hidden');

		fallback = people.filter((person) => person.firstName === 'WillowTree')[0];
		matpeople = people.filter((person) => person.firstName.startsWith('Mat'));

		$('#btn-game-standard').on('click', (event) => {
			event.preventDefault();

			if (mode !== 'standard') {
				mode = 'standard';
				$('#btn-game-mat').removeClass('btn-primary');
				$('#btn-game-mat').addClass('btn-secondary');

				$('btn-game-standard').removeClass('btn-secondary');
				$('btn-game-standard').addClass('btn-primary');

				resetScore();
				newRound();
			}
		});

		$('#btn-game-mat').on('click', (event) => {
			event.preventDefault();

			if (mode !== 'mat') {
				mode = 'mat';

				$('#btn-game-standard').removeClass('btn-primary');
				$('#btn-game-standard').addClass('btn-secondary');

				$('#btn-game-mat').removeClass('btn-secondary');
				$('#btn-game-mat').addClass('btn-primary');

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

		setTimeout(() => newRound(), 1000);
	}

	let incorrectClicked = () => {
		numWrong += 1;
		writeScore();
	}

	let writeScore = () => {
		let correctText = $('#correct-text');
		correctText.text(`Correct: ${numCorrect}`);

		let wrongText = $('#wrong-text');
		wrongText.text(`Incorrect: ${numWrong}`);
	};

	let generateRandomHeadshots = (parent, numHeadshots) => {
		// let parent = $('#headshot-container');
		// parent.empty();

		// let fallback = people.filter((person) => person.firstName === 'WillowTree')[0];

		let fullgroup = (mode === 'mat') ? matpeople : people;

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
	};

	let newRound = () => {
		let parent = $('#headshot-container');
		parent.empty();

		let target = generateRandomHeadshots(parent, 5);

		target = (mode === 'mat') ? 'Mat(' + target.slice(3) + ')' : target;

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
