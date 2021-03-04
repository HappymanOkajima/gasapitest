const FOLDER_ROOT = '1nNXbf8Gg1qncD8vSzgaz0XkqUj3IsRLL';

/**
 * GET /folders に対応
 */
function getFolders() {
  const root = DriveApp.getFolderById(FOLDER_ROOT);
  const folders = root.getFolders();
  const res = {folders: []};
  while (folders.hasNext()) {
    const f = folders.next();
    res.folders.push({id: f.getId(), folderName: f.getName()});
  }
  return res;
}
/**
 * GET /folders/{folderId} に対応
 */
function getFolder(folderId) {
  let folder;
  try {
    folder = DriveApp.getFolderById(folderId);
  } catch (e) {
    return {error: `folderId not found: ${folderId}`};
  }
  const res = {folders: []};
  res.folders.push({id: folder.getId(), folderName: folder.getName()});
  return res;
}
/**
 * POST /folders に対応
 */
function addFolder(folderName) {
  const root = DriveApp.getFolderById(FOLDER_ROOT);
  const id = root.createFolder(folderName).getId();
  return {status: 'success', folderName: folderName,folderId: id};
}
/**
 * PUT /folders/{folderId} に対応
 */
function setFolderName(folderId, folderName) {
  let folder;
  try {
    folder = DriveApp.getFolderById(folderId);
  } catch (e) {
    return {error: `folderId not found: ${folderId}`};
  }
  folder.setName(folderName);
  return {status: 'success', folderId: folderId, folderName: folderName};
}
/**
 * DELETE /folders/{folderId} に対応
 */
function removeFolder(folderId) {
  let folder;
  try {
    folder = DriveApp.getFolderById(folderId);
  } catch (e) {
    return {error: `folderId not found: ${folderId}`};
  }
  folder.setTrashed(true);
  return {status: 'success', folderId: folderId};
}

// ローカルなテスト用
function testGetFolders() {
  console.log(getFolders());
}
function testAddFolder() {
  console.log(addFolder('testf'));
}
function testRemoveFolder() {
  console.log(removeFolder(addFolder('removeTest').folderId));
}
function testSetFolderName() {
  console.log(setFolderName(addFolder('setTest').folderId, 'new_testf'));
}
function testGetFolder() {
  console.log(getFolder('16Gs1sMMdg9FzDiDZVT9YwZu1Ln4lo7nR'));
}
function testGetFolderError() {
  console.log(getFolder('aaa16Gs1sMMdg9FzDiDZVT9YwZu1Ln4lo7nR'));
}
/**
 * AppSheetで利用可能なレスポンスのサンプル
 * @see https://help.appsheet.com/en/articles/4438873-apigee-data-source
 */
function getResponseSample() {
  const res = {
    books: [
      {id: 1,
      asin:"4900000000123",
      name:"okajima book"
      },
      {id: 2,
      asin:"4900000000456",
      name:"あいうの秘密"
      }
    ]
  };

  return res;
}

