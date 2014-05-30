module.exports = {

  // the destination of the compiled
  // content string
  // e.g.:
  //
  // absolute path:
  // file:///srv/my_domain/public/folder_name
  //
  // relative path ( within currentDomain.getContentPath() )
  // public/my_folder_name
  //
  // ftp upload:
  // ftps://user:password@my.server.com/my/path
  //
  // these settings can be overridden by the domain workdirs setting
  // in the caminio frontend
  //
  destination: 'public/workdir_folder'

};
