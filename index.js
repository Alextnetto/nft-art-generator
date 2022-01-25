const {
  readFileSync,
  writeFileSync,
  readdirSync,
  rmSync,
  existsSync,
  mkdirSync,
} = require("fs");
const sharp = require("sharp");

const template = `
    <svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- bg -->
        <!-- drink -->
        <!-- eyes -->
        <!-- hair -->
        <!-- nose -->
        <!-- pc -->
    </svg>
`;

const takenNames = {};
const takenFaces = {};
let idx = 999;

function randInt(max) {
  return Math.floor(Math.random() * (max + 1));
}

function randElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomName() {
  const adjectives =
    "lazy old young crazy lazarento enthusiastic nasty stupid fired cringey intelligent dirty efficient simple stylish awesome creepy corny freaky shady sketchy lame sloppy hot intrepid juxtaposed killer ludicrous mangy pastey ragin rusty rockin sinful shameful stupid sterile ugly vascular wild zealous flamboyant super sly shifty trippy fried injured depressed anxious clinical".split(
      " "
    );
  const names =
    "lucas alex caique ederley dudu lele anderson fred grady harry ivan jeff joe kyle lester steve tanner lucifer todd mitch hunter mike arnold norbert olaf randy saul tevin jack ulysses vince will xavier zack roger dustin seth dennis".split(
      " "
    );

  const randAdj = randElement(adjectives);
  const randName = randElement(names);
  const name = `${randAdj}-${randName}`;

  if (takenNames[name] || !name) {
    return getRandomName();
  } else {
    takenNames[name] = name;
    return name;
  }
}

function getLayer(name, skip = 0.0) {
  const svg = readFileSync(`./layers/${name}.svg`, "utf-8");
  const re = /(?<=\<svg\s*[^>]*>)([\s\S]*?)(?=\<\/svg\>)/g;
  const layer = svg.match(re)[0];
  return Math.random() > skip ? layer : "";
}

async function svgToPng(name) {
  const src = `./out/${name}.svg`;
  const dest = `./out/${name}.png`;

  const img = await sharp(src);
  const resized = await img.resize(1024);
  await resized.toFile(dest);
}

function createImage(idx) {
  const bg = randInt(0);
  const drink = randInt(6);
  const eyes = randInt(3);
  const hair = randInt(6);
  const nose = randInt(2);
  const pc = randInt(5);
  // 3.528 combinations

  const face = [drink, eyes, hair, nose, pc].join("");

  if (face[takenFaces]) {
    createImage();
  } else {
    const name = getRandomName();
    console.log(name);
    face[takenFaces] = face;

    const final = template
      .replace("<!-- bg -->", getLayer(`bg${bg}`))
      .replace("<!-- drink -->", getLayer(`drink${drink}`))
      .replace("<!-- eyes -->", getLayer(`eyes${eyes}`))
      .replace("<!-- hair -->", getLayer(`hair${hair}`))
      .replace("<!-- nose -->", getLayer(`nose${nose}`))
      .replace("<!-- pc -->", getLayer(`pc${pc}`));

    const meta = {
      name,
      description: `A drawing of ${name.split("-").join(" ")}`,
      image: `${idx}.png`,
      attributes: [{ drink, eyes, hair, nose, pc }],
    };
    writeFileSync(`./out/${idx}.json`, JSON.stringify(meta));
    writeFileSync(`./out/${idx}.svg`, final);
    svgToPng(idx);
  }
}

// Create dir if not exists
if (!existsSync("./out")) {
  mkdirSync("./out");
}

// Cleanup dir before each run
readdirSync("./out").forEach((f) => rmSync(`./out/${f}`));

do {
  createImage(idx);
  idx--;
} while (idx >= 0);
