import test from 'node:test';
import assert from 'node:assert/strict';
import {createAvatar} from '../src/avatar.js';

test('Avatar besitzt Laufanimation und kann Ressourcen freigeben', () => {
  const avatar=createAvatar();
  assert.equal(typeof avatar.userData.update,'function');
  assert.equal(typeof avatar.userData.dispose,'function');
  assert.ok(avatar.children.length>0);
  assert.doesNotThrow(()=>avatar.userData.update(.016,5));
  assert.doesNotThrow(()=>avatar.userData.dispose());
});
