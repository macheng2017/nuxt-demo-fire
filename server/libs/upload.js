import qiniu from 'qiniu'
export default async function uploader(localFile, uploadToken, key) {
  let config = new qiniu.conf.Config()
  // config.useHttpsDomain = true
  // 华东地区的空间qiniu.zone.Zone_z0
  config.zone = qiniu.zone.Zone_z0
  // const bucketManager = new qiniu.rs.BucketManager(mac, config)
  let resumeUploader = new qiniu.resume_up.ResumeUploader(config)
  let putExtra = new qiniu.resume_up.PutExtra()
  // 扩展参数
  // this.putExtra.params = {
  //   'x:name': '',
  //   'x:age': 27,
  // }
  // this.putExtra.fname = 'testfile.mp4'

  // 如果指定了断点记录文件，那么下次会从指定的该文件尝试读取上次上传的进度，以实现断点续传
  putExtra.resumeRecordFile = 'progress.log'
  // let key = null
  // 文件分片上传
  resumeUploader.putFile(uploadToken, key, localFile, putExtra, function (respErr,
    respBody, respInfo) {
    if (respErr) {
      throw respErr
    }
    if (respInfo.statusCode === 200) {
      console.log(respBody)
    } else {
      console.log(respInfo.statusCode)
      console.log(respBody)
    }
  })
}
