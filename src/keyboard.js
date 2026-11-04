export function isInteractiveTarget(target) {
  if (!target) return false;
  const tag = String(target.tagName || '').toUpperCase();
  if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A'].includes(tag)) return true;
  if (target.isContentEditable) return true;
  return Boolean(target.closest?.('[contenteditable="true"], [role="textbox"]'));
}
