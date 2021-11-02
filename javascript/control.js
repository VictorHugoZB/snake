// ######################
// ##   DECLARATIONS   ##
// ######################

class Coords{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
}

let gameState = {
    PLAY: 'play',
    PAUSE: 'pause'
}

let pressed = {
    LEFT: 'left',
    UP: 'up',
    RIGHT: 'right',
    DOWN: 'down'
}

mystorage = localStorage;

const NUM_V_SQUARES = 10;
const NUM_H_SQUARES = 20;
let lastPressed;
let gameScreen = document.querySelector('#game-screen');
let gameScreenStyle = getComputedStyle(gameScreen);
let screenWidth = parseFloat(gameScreenStyle.width)
let screenHeight = parseFloat(gameScreenStyle.height)
let snake;
let collectableCoords;
let changeable;
let score = 0;
let bestScore = mystorage.getItem('snake-bs-vh') ? mystorage.getItem('snake-bs-vh') : 0;

// #################################################
// ##                EVENT LISTENERS              ##
// #################################################

/* changeable used to make sure the last pressed button was already processed before the next one,
   also, the function checks if the player is not going the opposite direction of the key he pressed */
let keyboardPress = document.addEventListener('keydown', (event) => {
    if (changeable) {
        if ((event.key == 'ArrowLeft' || event.key.toLowerCase() == 'a') && (lastPressed != pressed.RIGHT) ) {
            lastPressed = pressed.LEFT;
            document.querySelector('.press-any-key') ? document.querySelector('.press-any-key').remove() : null;
        } else if ((event.key == 'ArrowUp' || event.key.toLowerCase() == 'w') && (lastPressed != pressed.DOWN) ) {
            lastPressed = pressed.UP;
            document.querySelector('.press-any-key') ? document.querySelector('.press-any-key').remove() : null;  
        } else if ((event.key == 'ArrowRight' || event.key.toLowerCase() == 'd') && (lastPressed != pressed.LEFT) ) {
            lastPressed = pressed.RIGHT;
            document.querySelector('.press-any-key') ? document.querySelector('.press-any-key').remove() : null;
        } else if ((event.key == 'ArrowDown' || event.key.toLowerCase() == 's') && (lastPressed != pressed.UP) ) {
            lastPressed = pressed.DOWN;
            document.querySelector('.press-any-key') ? document.querySelector('.press-any-key').remove() : null;
        }
    }
    changeable = false;
});

// ######################
// ##     FUNCTIONS    ##
// ######################

function clearScreen(){
    gameScreen.style.backgroundColor = 'rgb(11, 48, 13)';
    while (gameScreen.firstChild)
        gameScreen.firstChild.remove();
}

function loadGameOverScreen(){
    clearScreen();

    if (score > bestScore){
        bestScore = score;
        mystorage.setItem('snake-bs-vh', score)
    }

    scoreP = document.createElement('p')
    scoreP.classList.add('game-over-p');
    scoreP.innerHTML = `<span style='color: chocolate;'>Score: ${score}   </span>|<span style='color: gold;'>   Best score: ${bestScore}</span>`;
    gameOverText = document.createElement('h1');
    gameOverText.innerHTML = 'You Lost!';
    gameOverText.classList.add('game-over-text');
    buttonsDiv = document.createElement('div');
    buttonsDiv.classList.add('display-buttons')
    b1 = document.createElement('button');
    b2 = document.createElement('button');
    b1.innerHTML = 'Try Again!'
    b2.innerHTML = 'Initial Page'
    b1.classList.add('gameover-buttons');
    b2.classList.add('gameover-buttons');
    buttonsDiv.appendChild(b1);
    buttonsDiv.appendChild(b2);
    gameScreen.appendChild(gameOverText);
    gameScreen.appendChild(scoreP);
    gameScreen.appendChild(buttonsDiv);

    b1.onclick = () => {
        initializeGame();
    }
}

function updateSnakeCoords(){
    // update body
    for (let i=snake.length-1; i>=1; i--){
        snake[i].x = snake[i-1].x;
        snake[i].y = snake[i-1].y
    }

    // update head
    if (lastPressed == pressed.UP)
        snake[0].y--;
    else if (lastPressed == pressed.DOWN)
        snake[0].y++;
    else if (lastPressed == pressed.LEFT)
        snake[0].x--;
    else if (lastPressed == pressed.RIGHT)
        snake[0].x++;

    changeable = true;
}

function generateRandomSpot(){
    randX = parseInt(Math.random()*NUM_H_SQUARES);
    randY = parseInt(Math.random()*NUM_V_SQUARES);
    for (let i = 0; i < snake.length; i++){
        if (randX == snake[i].x && randY == snake[i].y){
            return generateRandomSpot();
        }
    }
    return new Coords(randX, randY);
}

function paintRandomSpot(previousEl){
    if (previousEl)
        previousEl.classList.toggle('bg-strawberry');

    randomCoords = generateRandomSpot();
    newEl = document.querySelector(`div[data-column="${randomCoords.x}"][data-row="${randomCoords.y}"]`);
    newEl.classList.toggle('bg-strawberry');
    return randomCoords;
}

function initializeGame(){
    clearScreen();
    initialText = document.createElement('h1');
    initialText.innerHTML = 'Press any key';
    initialText.classList.add('press-any-key')
    gameScreen.appendChild(initialText);
    for (let i = 0; i < NUM_V_SQUARES; i++){
        for (let j = 0; j < NUM_H_SQUARES; j++){
            newDiv = document.createElement('div');
            newDiv.style.width = `${screenWidth / NUM_H_SQUARES}px`;
            newDiv.style.height = `${screenHeight / NUM_V_SQUARES}px`;
            newDiv.classList.add('inGameSquares');
            newDiv.setAttribute('data-column', `${j}`);
            newDiv.setAttribute('data-row', `${i}`);
            gameScreen.appendChild(newDiv);
        }
    }

    gameScreen.style.backgroundColor = 'transparent';
    score = 0
    changeable = true;
    lastPressed = null;
    snake = [new Coords(NUM_H_SQUARES/2, NUM_V_SQUARES/2)];
    x = snake[0].x;
    y = snake[0].y;
    el = document.querySelector(`div[data-column="${x}"][data-row="${y}"]`);
    el.classList.toggle('bg-body');
    collectableCoords = paintRandomSpot(null);
}

function checkGameOver(){
    gameover = false;
    if (snake[0].x >= 20 || snake[0].x < 0 || snake[0].y < 0 || snake[0].y >=10){
        return true;
    }
    for (let i=1; i<snake.length; i++){
        if (snake[0].x == snake[i].x && snake[0].y == snake[i].y){
            return true;
        }
    }
    return false;
}

initializeGame();


// MAIN GAME CODE
var main = setInterval(() => {
    if (!lastPressed) return;

    previousTaleX = snake[snake.length-1].x;
    previousTaleY = snake[snake.length-1].y;

    updateSnakeCoords();

    if (snake[0].x == collectableCoords.x && snake[0].y == collectableCoords.y){
        score++;
        oldCollectable = document.querySelector(`div[data-column="${collectableCoords.x}"][data-row="${collectableCoords.y}"]`);
        collectableCoords = paintRandomSpot(oldCollectable);
        snake.push(new Coords(previousTaleX, previousTaleY));
    } else {
        document.querySelector(`div[data-column="${previousTaleX}"][data-row="${previousTaleY}"]`).classList.toggle('bg-body');
    }

    if (checkGameOver()){
        changeable = false;
        lastPressed = null;
        loadGameOverScreen();
        return;
    }

    document.querySelector(`div[data-column="${snake[0].x}"][data-row="${snake[0].y}"]`).classList.toggle('bg-body');
    
    
}, 100)