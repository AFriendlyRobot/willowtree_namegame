// TODO: webpack/minify/transpile?
const HEADSHOT_SIZE = 170; // Half of the most common dimensions


function fetchNames(success) {
	$.ajax({
	    url: 'https://willowtreeapps.com/api/v1.0/profiles/',
	    success: success,
	});
}

function appendHeadshot(parent, person, fallback) {
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

	let wrapper = $('<div class="headshot-wrapper" id="' + id + '">');

	let img = $(imgStr);
	$(parent).append(wrapper);
	$(wrapper).append(img);

	$(wrapper).on('click', () => {
		// handleClick(id);
		console.log(data);
	});

	return (data !== 'WillowTree Staff') ? data : null;
}

function generateRandomHeadshots(parent, people, numHeadshots) {
	// let parent = $('#headshot-container');
	// parent.empty();

	let fallback = people.filter((person) => person.firstName === 'WillowTree')[0];

	let chosen = people.slice().sort(() => 0.5 - Math.random()).slice(0, numHeadshots);

	let names = [];

	for (let person of chosen) {
		names.push(appendHeadshot(parent, person, fallback));
	}

	return names;
}

function newRound(people) {
	let parent = $('#headshot-container');
	parent.empty();

	let names = generateRandomHeadshots(parent, people, 5);

	let target = names[Math.floor(Math.random() * names.length)];

	$("#target-header").html('Find ' + target);
}

$(window).on('load', function() {
	fetchNames(function(people) {
		window.people = people;
		newRound(people);
	});
});
