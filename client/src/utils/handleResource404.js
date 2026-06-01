export function handleResource404(
  error,
  navigate
) {
  if (
    error.response?.status === 404
  ) {
    navigate("/not-found");
    return true;
  }

  return false;
}