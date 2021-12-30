export default `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css?family=Ubuntu+Mono:300,400,700|Roboto:300,400,700" rel="stylesheet">
  <title>太白绘卷 @rlx/taibai</title>
  <style>
    html {
      font-size: 18px;
    }
    body {
        margin: 0;
        padding: 0;
    }
    * {
      font-family: 'Ubuntu Mono';
      font-size: 18px;
      font-weight: 400;
    }
  </style>
</head>

<body>
  <div id="redoc-container"></div>
  <script src="https://cdn.jsdelivr.net/npm/redoc@2.0.0-rc.55/bundles/redoc.standalone.min.js"> </script>
  <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/redoc-try-it-out/dist/try-it-out.min.js"></script>
  <script>
     RedocTryItOut.init(
        "spec.json",
        {
          title: "太白绘卷 @rlx/taibai",
          theme: {
            typography: {
              fontSize: '20px'
            }
          }
        },
        document.getElementById("redoc-container")
    )
  </script>
</body>

</html>
`;
