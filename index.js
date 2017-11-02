const fs = require('fs');
const Svgo = require('svgo');

if (process.argv.length !== 4) {
    console.log('Usage: svg-shake.js <bundle1.js,bundle2.js,...> <sprite.svg path>');
    process.exit(0);
}

const bundleJsPaths = process.argv[2];
const svgImagePath = process.argv[3];


const regSpriteInBundle = /"sprite\.svg#([^"]+)-usage"/gm;
const regSpriteId = /id="([^"]+)"/gm;

const spritesInBundle = {};
const spritesAllIds = {};

const bundleJsPathsArray = bundleJsPaths.split(',');
bundleJsPathsArray.forEach(file => {
    const content = fs.readFileSync(file).toString();
    let res;

    while ((res = regSpriteInBundle.exec(content)) !== null) {
        spritesInBundle[res[1]] = 1;
    }
});

const svgData = fs.readFileSync(svgImagePath, 'utf8');
const svgDataString = svgData.toString();
let res2;
while ((res2 = regSpriteId.exec(svgDataString)) !== null) {
    spritesAllIds[res2[1]] = 1;
}

const spritesAllIdsArray = Object.keys(spritesAllIds);
const spritesInBundleArray = Object.keys(spritesInBundle).reduce((acc, el) => {
    acc.push(el);
    acc.push(`${el}-usage`);
    return acc;
}, []);

const toRemove = spritesAllIdsArray.filter(item => spritesInBundleArray.indexOf(item) === -1);

const svgo = new Svgo({
    plugins: [
        {
            removeElementsByAttr: {
                id: toRemove,
            },
        },
    ],
});

svgo.optimize(svgData, result => {
    fs.writeFileSync(svgImagePath, result.data);
});

