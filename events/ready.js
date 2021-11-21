module.exports = {
    name: 'ready',
    once: true,
    execute () {
        console.log('Ready!');
        process.send('ready');
    }
};