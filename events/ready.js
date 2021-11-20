module.exports = {
    name: 'ready',
    once: true,
    execute (client) {
        console.log('Ready!');
        process.send('ready');
    }
};