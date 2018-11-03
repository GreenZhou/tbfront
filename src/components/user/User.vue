<template>
  <div class="user">
    <el-container>
      <el-header style="padding: 0px;display:flex;justify-content:space-between;align-items: center">
        <div style="display: inline">
          <el-input placeholder="名称搜索" clearable @change="keywordsChange" style="width: 300px;margin: 0px;padding: 0px;" 
            size="mini" @keyup.enter.native="searchUser" prefix-icon="el-icon-search" v-model="keywords">
          </el-input>
          <el-button type="primary" size="mini" style="margin-left: 5px" icon="el-icon-search" @click="searchUser">搜索
          </el-button>
        </div>
        <div style="margin-left: 5px;margin-right: 20px;display: inline">
          <el-upload :show-file-list="false" accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" action="http://127.0.0.1:8081/tbtool/user/importUsers" :data="tokenContainer"
            :on-success="fileUploadSuccess" :on-error="fileUploadError" :disabled="fileUploadBtnText=='正在导入'"
            :before-upload="beforeFileUpload" style="display: inline" :multiple='true' :limit="1" :with-credentials='true'>
            <el-button size="mini" type="success" :loading="fileUploadBtnText=='正在导入'">
              <i class="fa fa-lg fa-level-up" style="margin-right: 5px"></i>{{fileUploadBtnText}}
            </el-button>
          </el-upload>
          <el-button type="success" size="mini" @click="exportUsers">
            <i class="fa fa-lg fa-level-down" style="margin-right: 5px"></i>导出数据
          </el-button>
          <el-button type="primary" size="mini" icon="el-icon-plus" @click="showAddUserView"> 添加员工</el-button>
        </div>
      </el-header>
      <el-main>
        <div>
          <el-table :data="users" border stripe v-loading="tableLoading" @selection-change="handleSelectionChange" element-loading-text="拼命加载中..."
                    style="width: 100%" height="443">
            <el-table-column type="selection" align="left" width="30"></el-table-column>        
            <el-table-column prop="loginName" label="登录名" align="left"></el-table-column>
            <el-table-column prop="userName" label="用户名" align="left"></el-table-column>
            <el-table-column label="角色" align="left">
              <template slot-scope="scope">普通员工</template>
            </el-table-column>
            <el-table-column label="操作" align="center">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" @click="showUpdUserView(scope.row)">编辑</el-button>
                <el-button type="danger" size="mini" @click="delUser(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
           
          <div style="display: flex;justify-content: space-between;margin: 2px">
            <el-button type="danger" size="mini" v-if="users.length>0" :disabled="multipleSelection.length == 0"
              @click="delManyUsers">批量删除
            </el-button>
            <el-pagination
              background
              :page-size="1"
              :current-page="currentPage"
              @current-change="currentChange"
              layout="prev, pager, next"
              :total="totalPages">
            </el-pagination>
          </div>
        </div>
      </el-main> 
    </el-container>

    <!-- 数据编辑或者新增模块 -->
    <el-form :model="user" :rules="rules" ref="addUserForm" style="margin: 0px;padding: 0px;">
      <div style="text-align: left;">
        <el-dialog :title="dialogTitle" style="padding: 0px;" :close-on-click-modal="false" :visible.sync="dialogVisible" width="77%">
          <el-row>
            <div style="margin: 0 atuo;">
              <el-form-item label="登录名称:" prop="loginName">
                <el-input prefix-icon="el-icon-edit" v-model="user.loginName" size="mini" style="width: 500px"
                          placeholder="请输入用户系统登录姓名"></el-input>
              </el-form-item>
            </div>
          </el-row>
          <el-row>
            <div style="margin: 0 atuo;">
              <el-form-item label="用户名称:" prop="userName">
                <el-input prefix-icon="el-icon-edit" v-model="user.userName" size="mini" style="width: 500px"
                          placeholder="请输入用户名称"></el-input>
              </el-form-item>
            </div>
          </el-row>
          <el-row>
            <div style="margin: 0 atuo;">
              <el-form-item label="用户角色:" prop="userType">
                <el-radio-group v-model="user.userType">
                  <el-radio label=0>管理员</el-radio>
                  <el-radio style="margin-left: 15px" label=1>普通职员</el-radio>
                  <el-radio style="margin-left: 15px" label=2>买家</el-radio>
                </el-radio-group>
              </el-form-item>
            </div>
          </el-row>
          <span slot="footer" class="dialog-footer">
            <el-button size="mini" @click="cancelEidt">取 消</el-button>
            <el-button size="mini" type="primary" @click="addUser('addUserForm')">确 定</el-button>
          </span>
        </el-dialog>
      </div>
    </el-form>  
  </div>
</template>

<script>
export default {
  name: 'User',
  data () {
    return {
      tableLoading: false,
      fileUploadBtnText: '导入数据',
      users: [],
      totalPages: -1,
      currentPage: 1,
      showSize: 5,
      keywords: '',
      dialogTitle: '',
      dialogVisible: false,
      multipleSelection: [],
      user: {
          id: '',
          loginName: '',
          userName: '',
          userType: 1,
      },
      rules: {
        loginName: [{required: true, message: '必填:登录名称', trigger: 'blur'}],
        userName: [{required: true, message: '必填:用户名称', trigger: 'blur'}],
        userType: [{required: true, message: '必填:用户角色', trigger: 'blur'}],
      },
      tokenContainer: {
        token: '',
      },
    }
  },
  mounted: function() {
    this.initData();
  },
  methods: {
    initData() {
      var _this = this;
      this.tableLoading = true;
      this.constructReqData({}, this.currentPage, this.showSize).then(reqData => {
        _this.postRequest('http://127.0.0.1:8081/tbtool/user/list', reqData).then(resp=> {
          _this.tableLoading = false;
          if (resp && resp.status == 200) {
            var data = resp.data;
            _this.users = data.content.list;
            _this.totalPages = data.content.pageSize;
          }
        });
      });
      this.tokenContainer.token = this.storageManager.getToken();
    },
    cancelEidt() {
      this.dialogVisible = false;
    },
    addUser(formName) {
      var _this = this;
      this.$refs[formName].validate((valid) => {
        if (valid) {
          let url;
          if (this.user.id) {
            url = 'http://127.0.0.1:8081/tbtool/user/update';
          } else {
            url = 'http://127.0.0.1:8081/tbtool/user/save';
          }
          this.tableLoading = true;
          this.constructReqData(this.user).then((reqData) => {
            this.postRequest(url, reqData).then(resp=> {
            _this.tableLoading = false;
            if(resp && resp.status == 200) {
              var data = resp.data;
              if('0000' === data.code) {
                // 成功
                _this.$message({ type: 'info', message: data.message });
                _this.dialogVisible = false;
                _this.emptyUserData();
                _this.loadUsers();
              } else {
                // 失败
                _this.$message({ type: 'error', message: data.message });
              }
            }});
          });
        } else {
          return false;
        }
      });
    },
    delUser(row) {
      this.$confirm('此操作将永久删除[' + row.userName + '], 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.doDelete(row.id);
      }).catch(() => {
      });
    },
    delManyUsers() {
      this.$confirm('此操作将删除[' + this.multipleSelection.length + ']条数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        var ids = '';
        for (var i = 0; i < this.multipleSelection.length; i++) {
          if(i !== 0) {
            ids += ',';
          }
          ids += this.multipleSelection[i].id;
        }
        this.doDelete(ids);
      }).catch(() => {
      });
    },
    doDelete(ids){
      this.tableLoading = true;
      var _this = this;
      this.constructReqData({ ids: ids }).then(reqData => {
        _this.postRequest('http://127.0.0.1:8081/tbtool/user/del', reqData).then(resp=> {
          _this.tableLoading = false;
          if (resp && resp.status == 200) {
            var data = resp.data;
            if('0000' === data.code) {
              _this.$message({type: 'success', message: data.message});
              _this.loadUsers();
            } else {
              _this.$message({type: 'error', message: data.message});
            }
          }
        });
      });
    },
    showUpdUserView(row) {
      this.dialogTitle = "编辑员工";
      this.user.id = row.id;
      this.user.loginName = row.loginName;
      this.user.userName = row.userName;
      this.user.userType = row.userType;  
      this.dialogVisible = true;
    },
    currentChange(currentChange){
      this.currentPage = currentChange;
      this.loadUsers();
    },
    emptyUserData() {
      this.user = {
        loginName: '',
        userName: '',
        userType: 1,
      }; 
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    loadUsers(){
      var _this = this;
      this.tableLoading = true;
      this.constructReqData({name: this.keywords}, this.currentPage, this.showSize).then(reqData => {
        _this.postRequest('http://127.0.0.1:8081/tbtool/user/list', reqData).then(resp=> {
          _this.tableLoading = false;
          if (resp && resp.status == 200) {
            var data = resp.data;
            _this.users = data.content.list;
            _this.totalPages = data.content.pageSize;
          }
        });
      });
    },
    searchUser(){
      this.loadUsers();
    },
    showAddUserView(){
      this.dialogTitle = "添加用户";
      this.dialogVisible = true;
    },
    keywordsChange(val) {
      if (val == '') {
        this.loadUsers();
      }
    },
    
    beforeFileUpload(file){
      this.fileUploadBtnText = '正在导入';
    },
    fileUploadSuccess(response, file, fileList){
      if (response) {
        this.$message({type: response.status, message: response.msg});
      }
      this.loadUsers();
      this.fileUploadBtnText = '导入数据';
    },
    fileUploadError(err, file, fileList){
      this.$message({type: 'error', message: "导入失败!"});
      this.fileUploadBtnText = '导入数据';
    },
    exportUsers(){
      alert('此功能待完善中...');
    },
  }
}
</script>

<style>
</style>