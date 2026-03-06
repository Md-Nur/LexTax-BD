const { default: Markdown } = require('react-native-markdown-display');
const React = require('react');
const { Text } = require('react-native');

const rules = {
  heading1: (node, children, parent, styles) => {
    return React.createElement(Text, { key: node.key, style: styles.heading1 }, children);
  }
};
console.log(rules);
