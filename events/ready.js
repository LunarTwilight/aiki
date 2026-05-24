module.exports = {
    name: 'clientReady',
    once: true,
    execute () {
        console.log('Ready!');
        if (typeof process.send !== 'undefined') {
            process.send('ready');
        }
    }
};