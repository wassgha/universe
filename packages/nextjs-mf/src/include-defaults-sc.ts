// this is needed to ensure webpack does not attempt to tree shake unused modules. Since these should always come from host
require('react');
require('react-dom');
require('next/link');
require('next/head');
require('next/script');
require('next/dynamic');
//@ts-ignore
if (process.env.NODE_ENV === 'development') {
  require('react/jsx-dev-runtime');
}

module.exports = {};