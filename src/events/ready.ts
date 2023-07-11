export default {
    name: 'ready',
    once: true,
    execute () {
        console.log('Ready!');
        if (typeof process.send !== 'undefined') {
            process.send('ready');
        }
    }
};