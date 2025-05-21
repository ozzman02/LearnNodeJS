function formatError({ path, msg, value }) {
  const namespace = path.split('.'); // Handle nested properties
  let formParam = namespace.shift();
  
  while (namespace.length) {
    formParam += `[${namespace.shift()}]`;
  }
  
  return {
    param: formParam, // Properly formatted parameter name
    msg: msg,         // Error message
    value: value      // Input value that caused the error
  };
}

module.exports = formatError;
