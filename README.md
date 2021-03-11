# gasapitest
GAS関数をApigee経由でAPI化してみる

## APIのテスト方法

### サーバーの立ち上げ。

事前に `$ npm install ` をしておくこと。

```
$ node .
```

### 認証（トークンの作成）

最初に行う必要があります。クレデンシャル（credentials.json）をexpressを実行しているディレクトリに配置後、ブラウザから http://localhost:9000/auth にアクセスし、その後は画面の指示に従ってください。成功すると、expressを実行しているディレクトリにトークンファイル（token.json）が書き出されます。

### APIのコール。例えばフォルダ一覧を取得する場合。

```
$ curl http://localhost:9000/folders
```

