module.exports = {
    name: 'clientReady',
    once: true,
    execute () {
        console.log('Ready!');
        if (process.send !== 'undefined') {
            process.send('ready');
        }
    }
};