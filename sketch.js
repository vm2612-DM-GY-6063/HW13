// Serial variables
let mSerial;
let connectButton;
let readyToReceive;

// Project variables
let largeDotSize = 30; // Default large dot size
let smallDotSize = 15; // Fixed small dot size
let spacing = 40; // Spacing between dots
let backgroundColor = 255; // Default background color

function receiveSerial() {
  // Check if there's data available
  let line = mSerial.readUntil("\n");
  line = trim(line);
  if (!line) return;

  if (line.charAt(0) != "{") {
    print("Error: ", line);
    readyToReceive = true; // Reset readyToReceive to avoid blocking
    return;
  }

  // Parse JSON and handle input
  let data = JSON.parse(line).data;
  let a0 = data.A0;
  let d2 = data.D2;

  if (a0.value !== undefined) {
    largeDotSize = map(a0.value, 0, 4095, 10, 100); // Adjust large dot size
  }
  if (d2.value !== undefined) {
    backgroundColor = map(d2.value, 0, 1, 0, 255); // Adjust background color
  }

  readyToReceive = true; // Reset flag to allow continuous communication
}

function connectToSerial() {
  if (!mSerial.opened()) {
    mSerial.open(9600);
    readyToReceive = true;
    connectButton.hide();
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  mSerial = createSerial();

  connectButton = createButton("Connect To Serial");
  connectButton.position(width / 2, height / 2);
  connectButton.mousePressed(connectToSerial);

  readyToReceive = false;
}

function draw() {
  // Update background color dynamically
  background(backgroundColor);

  noStroke();
  
  // Draw large dots in rows
  for (let y = 0; y < height; y += spacing * 2) {
    for (let x = 0; x < width; x += spacing * 2) {
      fill(0);
      ellipse(x, y, largeDotSize, largeDotSize); // Larger dots
    }
  }
  
  // Offset rows for large dots
  for (let y = spacing; y < height; y += spacing * 2) {
    for (let x = spacing; x < width; x += spacing * 2) {
      fill(0);
      ellipse(x, y, largeDotSize, largeDotSize);
    }
  }
  
  // Draw small dots at every grid point
  for (let y = 0; y < height; y += spacing) {
    for (let x = 0; x < width; x += spacing) {
      fill(0);
      ellipse(x, y, smallDotSize, smallDotSize);
    }
  }

  // Continuously request serial data
  if (mSerial.opened() && readyToReceive) {
    readyToReceive = false;
    mSerial.clear(); // Clear any old data
    mSerial.write(0xab); // Request new data
  }

  // Check for incoming serial data
  if (mSerial.availableBytes() > 8) {
    receiveSerial();
  }
}
