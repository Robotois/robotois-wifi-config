exports.apTemplate = content => `#--ap-begin
${content}
#--ap-end`;

exports.contentReplacer = (content, patterns = 3) => {
  switch (patterns) {
    case 3:
      return (str, p1, p2, p3, offset, s) => [p1, content, p3].join('\n');
    case 4:
      return (str, p1, p2, p3, p4, offset, s) => [p1, content, p4].join('\n');
    default:
  }
  return null;
};

exports.simpleReplace = content => (str, p1, offset, s) => content;
