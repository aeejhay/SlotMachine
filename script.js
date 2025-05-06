const SYMBOLS = [
  "img/watermelon.png", "img/banana.png", "img/yourlogo.png", "img/grape.png",
  "img/cherry.png", "img/lemon.png", "img/orange.png", "img/seven.png"
];

const NUM_RESULT_SYMBOLS = 3;
const SYMBOLS_PER_REEL = 26;
const NUM_VISIBLE_SYMBOLS = 3;

const reels = $('.reel');
const reelImages = new Array(reels.length).fill([]).map(initDefaultSymbols);
const spinSounds = reels.map(() => new Audio('audio/spin.wav'));

const spinDurationPromise = new Promise(resolve => {
  $(spinSounds[0]).on('loadedmetadata', function () {
    resolve(Math.round(spinSounds[0].duration) * 1000);
  });
});

let firstSpinComplete = false;

reels.each(function(index) {
  populateReelWithSymbols($(this), reelImages[index], SYMBOLS_PER_REEL - NUM_VISIBLE_SYMBOLS);
});

$('#spin-button').on("click", handleSpin);

async function handleSpin() {
  $(this).prop('disabled', true);
  $('#spin-icon').addClass("spin");

  reels.each(function() {
    resetReel($(this));
  });

  if (firstSpinComplete) {
    reels.each(function(index) {
      populateReelWithSymbols($(this), reelImages[index], SYMBOLS_PER_REEL - NUM_VISIBLE_SYMBOLS);
    });
  }

  reels.each(function(index) {
    setTimeout(() => {
      spinReel($(this));
      spinSounds[index].play();
    }, index * 1000);
  });

  const spinDuration = await spinDurationPromise;
  setTimeout(() => {
    $('#spin-icon').removeClass("spin");
    $(this).prop('disabled', false);

    const results = [];
    $('.result-symbol').each(function() {
      const imgPath = $(this).attr("src");
      const match = imgPath.match(/\/([^.\/]+)\.png$/);
      results.push(match[1].toUpperCase());
    });

    console.log('Results:', results);
	
	// Check if all symbols match
	if (results.every(val => val === results[0])) {
	  $('#congrats-popup').fadeIn();
	  document.getElementById('congrats-sound').play();
	  setTimeout(() => {
		$('#congrats-popup').fadeOut();
	  }, 3000);
	}
	
    firstSpinComplete = true;
  }, spinDuration + (reels.length - 1) * 1000);

}

function initDefaultSymbols() {
  const symbols = [];
  for (let i = SYMBOLS_PER_REEL - 1; i >= SYMBOLS_PER_REEL - NUM_VISIBLE_SYMBOLS; i--) {
    symbols[i] = SYMBOLS[SYMBOLS_PER_REEL - 1 - i];
  }
  return symbols;
}

function resetReel(reel) {
  reel.css({ top: "-3805px" });
}

function spinReel(reel) {
  reel.animate({ top: "-390px" }, 5000);
}

function getUniqueRandomIndex(exclude) {
  let rand = Math.floor(Math.random() * SYMBOLS.length);
  if (exclude.includes(rand)) {
    return getUniqueRandomIndex(exclude);
  }
  return rand;
}

function fillWithRandomSymbols(array, count) {
  const recentRandoms = [];
  for (let i = 0; i < count; i++) {
    const rand = getUniqueRandomIndex(recentRandoms.slice(-2));
    recentRandoms.push(rand);
    array[i] = SYMBOLS[rand];
  }
}

function appendSymbolsToReel(reel, symbols) {
  const fragment = $(document.createDocumentFragment());
  symbols.forEach((src, i) => {
    const img = $('<img>', { src });
    if (i === NUM_RESULT_SYMBOLS) img.addClass('result-symbol');
    fragment.append(img);
  });
  reel.empty().append(fragment);
}

function retainVisibleSymbols(array, startIndex) {
  if (array[NUM_RESULT_SYMBOLS] !== undefined) {
    for (let i = startIndex; i < array.length; i++) {
      array[i] = array[i - startIndex + NUM_RESULT_SYMBOLS - 1];
    }
  }
}

function populateReelWithSymbols(reel, symbolArray, fillCount) {
  retainVisibleSymbols(symbolArray, fillCount);
  fillWithRandomSymbols(symbolArray, fillCount);
  appendSymbolsToReel(reel, symbolArray);
}
