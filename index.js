const iconWidth = 79;
const iconHeight = 79;
const numOfIcons = 9;
const timePerIcon = 100;

const indexes = [0, 0, 0];
const iconMap = ['banana', 'seven', 'cherry', 'plum', 'orange', 'bell', 'bar', 'lemon', 'melon'];

var rolling = false;
const rollBtn = document.getElementById("roll-btn");
rollBtn.addEventListener("click", () => {
    if (!rolling) {
        rollAll();
    }
});

const roll = (reel, offset = 0) => {
    const delta = (offset + 2) * numOfIcons + Math.floor(Math.random() * numOfIcons);
    const style = getComputedStyle(reel);
    var bgPositionY = parseFloat(style["background-position-y"]);
    var targetPositionY = bgPositionY + delta * iconHeight;
    var normTargetBgPositionY = targetPositionY % (numOfIcons * iconHeight);

    return new Promise((resolve, reject) => {

        reel.style.transition = `background-position-y ${8 + delta * timePerIcon}ms cubic-bezier(.5,-0.11,.54,1.46)`;
        reel.style.backgroundPositionY = `${targetPositionY}px`;

        setTimeout(() => {
            reel.style.transition = 'none';
            reel.style.backgroundPositionY = `${normTargetBgPositionY}px`;
            resolve(delta % numOfIcons)
        }, 8 + delta * timePerIcon);
    })
};

function rollAll() {
    rolling = true;
    const reelsList = document.querySelectorAll('.slots > .reel');
    Promise
    .all( [...reelsList].map((reel, i) => roll(reel, i)))
        .then((delta) => {
            delta.forEach((delta, i) => {
                indexes[i] = (indexes[i] += delta) % numOfIcons;
            })
            indexes.map((index) => {
                console.log(iconMap[index]);
            });

            // check win condition
            if ((indexes[0] === indexes[1]) || (indexes[0] === indexes[1] === indexes[2])) {
                console.log("WINWINWINWI!");
            }

            setTimeout(() => {rolling = false;}, 1000);
        });
    // [...reelsList].map((reel, i) => {
    //     roll(reel, i).then((delta) => { console.log(delta)});
    // });
}