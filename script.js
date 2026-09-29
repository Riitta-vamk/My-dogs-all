const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');

const journalTitle = 'Northbound Journal';
console.log(`Welcome to ${journalTitle}!`);

const routeDistance = 12;
if (routeDistance <= 10) {
  console.log('This route is a short walk.');
} else {
  console.log('This route is a longer adventure.');
}

function addTrailTime(walkMinutes) {
  const restMinutes = 15;
  return walkMinutes + restMinutes;
}

console.log(`Estimated trail time: ${addTrailTime(routeDistance)} minutes.`);

const destinations = ['The coast', 'The wild', 'The city'];
destinations.forEach((destination, index) => {
  console.log(`${index + 1}. ${destination}`);
});

if (toggle && links) {
  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
}

const year = document.querySelector('[data-year]');
if (year) year.textContent = new Date().getFullYear();

const routeButton = document.querySelector('#route-button');
const routeStatus = document.querySelector('#route-status');
const routeResults = document.querySelector('#route-results');

async function fetchFieldNotes() {
  const responses = await Promise.all(
    [1, 2, 3].map((noteNumber) =>
      fetch(`https://api.adviceslip.com/advice?note=${Date.now()}-${noteNumber}`)
    )
  );

  if (responses.some((response) => !response.ok)) {
    throw new Error('The field notes service returned an error.');
  }

  const notes = await Promise.all(responses.map((response) => response.json()));
  console.log('Field notes API response:', notes);
  return notes;
}

if (routeButton && routeStatus && routeResults) {
  routeButton.addEventListener('click', async () => {
    routeButton.disabled = true;
    routeStatus.textContent = 'Retrieving field notes...';
    routeResults.replaceChildren();

    try {
      const notes = await fetchFieldNotes();
      notes.forEach(({ slip }) => {
        const note = document.createElement('p');
        note.className = 'api-note';
        note.textContent = slip.advice;
        routeResults.append(note);
      });
      routeStatus.textContent = 'Three notes for the road:';
    } catch (error) {
      console.error('Unable to retrieve field notes:', error);
      routeStatus.textContent = 'We could not retrieve field notes. Please try again.';
    } finally {
      routeButton.disabled = false;
    }
  });
}

const breedSelect = document.querySelector('#breed-select');
const breedButton = document.querySelector('#breed-button');
const breedStatus = document.querySelector('#breed-status');
const breedResults = document.querySelector('#breed-results');

function titleCase(value) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

async function loadBreedGroups() {
  const response = await fetch('https://dog.ceo/api/breeds/list/all');
  if (!response.ok) throw new Error('The breed list service returned an error.');
  const { message: breeds } = await response.json();
  console.log('Dog breed groups API response:', breeds);

  Object.entries(breeds).forEach(([breed, subBreeds]) => {
    const group = document.createElement('optgroup');
    group.label = titleCase(breed);
    const breedOption = document.createElement('option');
    breedOption.value = breed;
    breedOption.textContent = titleCase(breed);
    group.append(breedOption);
    subBreeds.forEach((subBreed) => {
      const option = document.createElement('option');
      option.value = `${breed}/${subBreed}`;
      option.textContent = `${titleCase(breed)} - ${titleCase(subBreed)}`;
      group.append(option);
    });
    breedSelect.append(group);
  });
}

async function loadDogImages(breedPath) {
  const response = await fetch(`https://dog.ceo/api/breed/${breedPath}/images/random/4`);
  if (!response.ok) throw new Error('The dog image service returned an error.');
  const result = await response.json();
  console.log(`Dog images API response for ${breedPath}:`, result);
  return result.message;
}

if (breedSelect && breedButton && breedStatus && breedResults) {
  loadBreedGroups()
    .then(() => {
      breedSelect.querySelector('option').remove();
      breedSelect.disabled = false;
      breedButton.disabled = false;
      breedStatus.textContent = 'Select a group to find four dogs.';
    })
    .catch((error) => {
      console.error('Unable to retrieve breed groups:', error);
      breedStatus.textContent = 'We could not retrieve breed groups. Please refresh and try again.';
    });

  breedButton.addEventListener('click', async () => {
    breedButton.disabled = true;
    breedStatus.textContent = 'Retrieving data...';
    breedResults.replaceChildren();

    try {
      const imageUrls = await loadDogImages(breedSelect.value);
      imageUrls.forEach((imageUrl) => {
        const image = document.createElement('img');
        image.src = imageUrl;
        image.alt = `Dog from the ${breedSelect.value.replace('/', ' ')} breed group`;
        breedResults.append(image);
      });
      breedStatus.textContent = `Four dogs from the ${titleCase(breedSelect.value.replace('/', ' '))} group:`;
    } catch (error) {
      console.error('Unable to retrieve dog images:', error);
      breedStatus.textContent = 'We could not retrieve dog photos. Please try again.';
    } finally {
      breedButton.disabled = false;
    }
  });
}
