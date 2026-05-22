(function () {
  var repoPath = '/Bay-Area-Professional-Counseling-Site';

  if (!/\.github\.io$/.test(window.location.hostname)) return;

  function prefixProjectPath(value) {
    if (!value || value.charAt(0) !== '/' || value.charAt(1) === '/') return value;
    if (value.indexOf(repoPath + '/') === 0 || value === repoPath) return value;
    return value === '/' ? repoPath + '/' : repoPath + value;
  }

  function rewriteAttribute(element, attributeName) {
    var value = element.getAttribute(attributeName);
    var nextValue = prefixProjectPath(value);
    if (nextValue !== value) element.setAttribute(attributeName, nextValue);
  }

  function rewritePaths() {
    document.querySelectorAll('[href]').forEach(function (element) {
      rewriteAttribute(element, 'href');
    });

    document.querySelectorAll('[src]').forEach(function (element) {
      rewriteAttribute(element, 'src');
    });

    document.querySelectorAll('use').forEach(function (element) {
      rewriteAttribute(element, 'href');
      rewriteAttribute(element, 'xlink:href');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', rewritePaths);
  } else {
    rewritePaths();
  }
}());
