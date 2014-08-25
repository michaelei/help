<%@ page language="java" contentType="text/html; charset=utf-8"
    pageEncoding="utf-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<link rel="stylesheet" type="text/css" href="easyui/themes/default/easyui.css">
<link rel="stylesheet" type="text/css" href="easyui/themes/icon.css">
<script type="text/javascript" src="easyui/jquery.min.js"></script>
<script type="text/javascript" src="easyui/jquery.easyui.min.js"></script>
<script type="text/javascript" src="easyui/jsloader.js"></script>
<script type="text/javascript" src="js/index.js"></script>
<title>英杰无线门锁接口(EgIntf3)API说明</title>
<style type="text/css">
body {
	font-family: "微软雅黑";
	font-size: 14px;
}
.font-tree-folder {
	font-size:14px;
	font-weight:bold;
}
</style>
</head>
<body class="easyui-layout">
<div data-options="region:'north'" style="height:83px">
  <table width="100%" border="0" cellspacing="0">
    <tr>
      <td style="width:118px;"><img src="icon/lock1.jpg" width="117" height="78"></td>
      <td align="left" valign="top"><table width="100%" border="0" cellspacing="0">
        <tr>
          <td style="font-size:36px;">英杰无线门锁接口(EgIntf3)API说明</td>
        </tr>
        
      </table></td>
    </tr>
  </table>
</div>
<div data-options="region:'west',collapsible:false" style="width:260px;padding:1px;">
<jsp:include page="tree.jsp" />
</div>
<div data-options="region:'center'" style="paddng:1px;">
<iframe id="iframe_center" width="99%" height="99%" src="basic1.htm"></iframe>
</div>
</body>
</html>