const { exec } = require('child_process')
exec('hexo server -p 4001 & ',(error, stdout, stderr) => {
        if(error){
                console.log('exec error: ${error}')
                return
        }
        console.log('stdout: ${stdout}');
        console.log('stderr: ${stderr}');
})


//二、安装pm2 npm install -g pm2
//三、启动博客 pm2 start hexo_run.js
//在相应的文件夹里，运行pm2 stop hexo_run.js  也支持 restart



