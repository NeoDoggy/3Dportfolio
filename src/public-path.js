export function publicPath(path) {
  if (/^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }

  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
}
