let training_images = [];
let training_labels = [];
let parsing_images = true;
let parsing_labels = true;
const image_width = 28;
const image_height = 28;
const image_channels = 1;
const output_size = 10;
let parseImages = () => {
    let temparray = [];
    for (let i = 0; i < image_height; i++) {
        for (let j = 0; j < image_width; i++) {
            let index = (i * image_width) + j
            temparray[i].push(training_images[index])
        }
    }
    console.log(temparray);
}
let parseLabels = () => {

}
fetch('train-images-idx3-ubyte')
    .then(data => {
        let training_data = Array.from(data.arrayBuffer());
        training_data.splice(0, 16);
        parseImages();
        parsing_images = false;
    })
    .catch(err => {
        console.log(err)
    })

fetch('train-labels-idx1-ubyte')
    .then(data => {
        let training_labels = Array.from(data.arrayBuffer());
        training_labels.splice(0, 8);
        parseLabels();
        parsing_labels = false
    })

const model = tf.sequential();

model.add(tf.layers.dense({
    inputShape: [image_width, image_height, image_channels],
    units: 100,
    activation: 'elu'
}))
model.add(tf.layers.flatten())
model.add(tf.layers.dense({
    activation: 'elu',
    units: 100,
}))
model.add(tf.layers.flatten())
model.add(tf.layers.dense({
    activation: 'elu',
    units: 100,
}))
model.add(tf.layers.flatten());
model.add(tf.layers.dense({
    units: output_size,
    activation: 'softmax',
}))
const optimizer = tf.train.sgd()
model.compile({
    optimizer: optimizer,
    loss: 'meanSquaredError',
    metrics: ['accuracy']
})
for (let i = 0; i < training_images.length / 10000; i++) {
    model.fit()
}