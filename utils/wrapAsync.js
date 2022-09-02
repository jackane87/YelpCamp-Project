//This is a wrapper function that allows us to handle potential errors from async functions.
module.exports = func=>{
    return (req, res, next) =>{
        func(req, res, next).catch(next);
    }
}