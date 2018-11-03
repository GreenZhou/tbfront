<template>
<div>
  <div class="taskDetail">
    <el-container>
      <el-header style="padding: 0px;display:flex;justify-content:space-between;align-items: center">
        <div style="display: inline">
          <el-input placeholder="名称搜索" clearable @change="keywordsChange" style="width: 300px;margin: 0px;padding: 0px;" 
            size="mini" @keyup.enter.native="searchTaskDetail" prefix-icon="el-icon-search" v-model="keywords">
          </el-input>
          <el-button type="primary" size="mini" style="margin-left: 5px" icon="el-icon-search" @click="searchTaskDetail">搜索
          </el-button>
        </div>
        <div style="margin-left: 5px;margin-right: 20px;display: inline">
          <el-upload :show-file-list="false" accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" :action="uploadUrl()"  :data="tokenContainer"
            :on-success="fileUploadSuccess" :on-error="fileUploadError" :disabled="fileUploadBtnText=='正在导入'"
            :before-upload="beforeFileUpload" style="display: inline" :multiple='true' :limit="1" :with-credentials='true'>
            <el-button size="mini" type="success" :loading="fileUploadBtnText=='正在导入'">
              <i class="fa fa-lg fa-level-up" style="margin-right: 5px"></i>{{fileUploadBtnText}}
            </el-button>
          </el-upload>
          <el-button type="success" size="mini" @click="exportTaskDetails">
            <i class="fa fa-lg fa-level-down" style="margin-right: 5px"></i>导出数据
          </el-button>
          <el-button type="primary" size="mini" icon="el-icon-plus" @click="showAddTaskDetailView">添加明细</el-button>
        </div>
      </el-header>
      <el-main>
        <div>
          <el-table :data="details" border stripe v-loading="tableLoading" @selection-change="handleSelectionChange" element-loading-text="拼命加载中..."
                    style="width: 100%" height="443">
            <el-table-column type="selection" align="left" width="30"></el-table-column>        
            <el-table-column prop="taskDetailName" label="任务明细名称" align="left"></el-table-column>
            <el-table-column prop="taskDesc" label="任务描述" align="left"></el-table-column>
            <el-table-column prop="salerName" label="店铺名称" align="left"></el-table-column>
            <el-table-column prop="salerTMName" label="店铺旺旺" align="left"></el-table-column>
            <el-table-column prop="customerName" label="任务接收人" align="left"></el-table-column>
            <el-table-column prop="taskUnitPrice" label="单价" align="left"></el-table-column>
            <el-table-column prop="taskNum" label="数量" align="left"></el-table-column>
            <el-table-column prop="taskTotalPrice" label="总价" align="left"></el-table-column>
            <el-table-column label="状态" align="left">
              <template slot-scope="scope">未发布</template>
            </el-table-column>
            <el-table-column label="操作" align="center">
              <template slot-scope="scope">
                <el-button type="success" size="mini" @click="showUpdTaskDetailView(scope.row)">编辑</el-button>
                <el-button type="danger" size="mini" @click="delTaskDetail(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
           
          <div style="display: flex;justify-content: space-between;margin: 2px">
            <el-button type="danger" size="mini" v-if="details.length>0" :disabled="multipleSelection.length == 0"
              @click="delManyTaskDetails">批量删除
            </el-button>
            <el-pagination background :page-size="1" :current-page="currentPage" @current-change="currentChange"
              layout="prev, pager, next" :total="totalPages">
            </el-pagination>
          </div>
        </div>
      </el-main> 
    </el-container>

    <!-- 数据编辑或者新增模块 -->
    <el-form :model="detail" :rules="rules" ref="addTaskDetailForm" style="margin: 0px;padding: 0px;">
      <div style="text-align: left;">
        <el-dialog :title="dialogTitle" style="padding: 0px;" :close-on-click-modal="false" :visible.sync="dialogVisible" width="77%">
          <el-row>
            <div style="margin: 0 atuo;">
              <el-form-item label="明细名称:" prop="taskDetailName">
                <el-input prefix-icon="el-icon-edit" v-model="detail.taskDetailName" size="mini" style="width: 500px"
                          placeholder="请输入明细名称"></el-input>
              </el-form-item>
            </div>
          </el-row>
          <el-row>
            <div style="margin: 0 atuo;">
              <el-form-item label="明细描述:" prop="taskDesc">
                <el-input prefix-icon="el-icon-edit" v-model="detail.taskDesc" size="mini" style="width: 500px"
                          placeholder="请输入明细描述"></el-input>
              </el-form-item>
            </div>
          </el-row>
          <el-row>
            <div style="margin: 0 atuo;">
              <el-form-item label="店铺名称:" prop="salerName">
                <el-input prefix-icon="el-icon-edit" v-model="detail.salerName" size="mini" style="width: 500px"
                          placeholder="请输入店铺名称"></el-input>
              </el-form-item>
            </div>
          </el-row>
          <el-row>
            <div style="margin: 0 atuo;">
              <el-form-item label="店铺旺旺:" prop="salerName">
                <el-input prefix-icon="el-icon-edit" v-model="detail.salerTMName" size="mini" style="width: 500px"
                          placeholder="请输入店铺旺旺"></el-input>
              </el-form-item>
            </div>
          </el-row>
          <el-row>
            <div style="margin: 0 atuo;">
              <el-form-item label="任务接收人:" prop="customerName">
                <el-select v-model="detail.customerId" placeholder="请选择">
                  <el-option v-for="(item,index) in customers" :key="index" :label="item.userName" :value="item.id">
                  </el-option>
                </el-select>          
              </el-form-item>
            </div>
          </el-row>
          <el-row>
            <div style="margin: 0 atuo;">
              <el-form-item label="单价:" prop="taskUnitPrice">
                <el-input prefix-icon="el-icon-edit" v-model="detail.taskUnitPrice" size="mini" style="width: 500px"
                          placeholder="请输入单价"></el-input>          
              </el-form-item>
            </div>
          </el-row>
          <el-row>
            <div style="margin: 0 atuo;">
              <el-form-item label="数量:" prop="taskNum">
                <el-input prefix-icon="el-icon-edit" v-model="detail.taskNum" size="mini" style="width: 500px"
                          placeholder="请输入具体数量"></el-input>          
              </el-form-item>
            </div>
          </el-row>
          <span slot="footer" class="dialog-footer">
            <el-button size="mini" @click="cancelEidt">取 消</el-button>
            <el-button size="mini" type="primary" @click="addTaskDetail('addTaskDetailForm')">确 定</el-button>
          </span>
        </el-dialog>
      </div>
    </el-form>
  </div>
</div>
</template>

<script>
export default {
  name: 'TaskDetail',
  data () {
    return {
      tableLoading: false,
      fileUploadBtnText: '导入数据',
      details: [],
      customerId: '',
      customers: [],
      totalPages: -1,
      currentPage: 1,
      showSize: 5,
      keywords: '',
      dialogTitle: '',
      dialogVisible: false,
      multipleSelection: [],
      detail: {
          id: '',
          taskDetailName: '',
          customerId: '',
          customerName: '',
          status: 0,
          createTime: '',
      },
      rules: {
        taskDetailName: [{required: true, message: '必填:任务明细名称', trigger: 'blur'}],
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
      this.loadTaskDetails();
      /*
      this.constructReqData({}, this.currentPage, this.showSize).then(reqData => {
        _this.postRequest('http://127.0.0.1:8081/tbtool/task/detail/list', reqData).then(resp=> {
          _this.tableLoading = false;
          if (resp && resp.status == 200) {
            var data = resp.data;
            _this.details = data.content.list;
            _this.totalPages = data.content.pageSize;
          }
        });
      });
      */
      this.tokenContainer.token = this.storageManager.getToken();
    },
    emptyTaskDetailData() {
      this.details = [];
      this.totalPages = -1;
    },
    cancelEidt() {
      this.dialogVisible = false;
    },
    addTaskDetail(formName) {
      var _this = this;
      
      this.$refs[formName].validate((valid) => {
        if (valid) {
          let url;
          if (this.detail.id) {
            url = 'http://127.0.0.1:8081/tbtool/task/detail/update';
          } else {
            url = 'http://127.0.0.1:8081/tbtool/task/detail/save';
          }
          this.tableLoading = true;
          this.constructReqData(this.detail).then((reqData) => {
            this.postRequest(url, reqData).then(resp=> {
            _this.tableLoading = false;
            if(resp && resp.status == 200) {
              var data = resp.data;
              if('0000' === data.code) {
                // 成功
                _this.$message({ type: 'info', message: data.message });
                _this.dialogVisible = false;
                _this.emptyTaskDetailData();
                _this.loadTaskDetails();
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
    delTaskDetail(row) {
      this.$confirm('此操作将永久删除[' + row.taskDetailName + '], 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.doDelete(row.id);
      }).catch(() => {
      });
    },
    delManyTaskDetails() {
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
      this.constructReqData({ ids: ids, instanceId: this.$router.currentRoute.params.id }).then(reqData => {
        _this.postRequest('http://127.0.0.1:8081/tbtool/task/detail/del', reqData).then(resp=> {
          _this.tableLoading = false;
          if (resp && resp.status == 200) {
            var data = resp.data;
            if('0000' === data.code) {
              _this.$message({type: 'success', message: data.message});
              _this.loadTaskDetails();
            } else {
              _this.$message({type: 'error', message: data.message});
            }
          }
        });
      });
    },
    showUpdTaskView(row) {
      var _this = this;
      this.dialogTitle = "编辑任务明细";
      this.detail.id = row.id;
      this.detail.taskId = row.taskId;
      this.detail.taskDetailName = row.taskDetailName;
      this.detail.taskDesc = row.taskDesc;
      this.detail.taskUrl = row.taskUrl;
      this.detail.taskDesc = row.taskDesc;
      this.detail.salerId = row.salerId;
      this.detail.salerName = row.salerName;
      this.detail.salerTMName = row.salerTMName;
      this.detail.customerId = row.customerId;
      this.detail.customerName = row.customerName;
      this.detail.taskNum = row.taskNum;
      this.detail.taskUnitPrice = row.taskUnitPrice;
      this.detail.taskTotalPrice = row.taskTotalPrice;
      this.detail.totalCommission = row.totalCommission;
      this.detail.customerCommission = row.customerCommission;
      this.detail.createTime = row.createTime;
      this.detail.status = row.status;
      this.dialogVisible = true;
      if(this.customers || this.customers.length === 0) {
        this.constructReqData({}).then(reqData => {
        _this.postRequest('http://127.0.0.1:8081/tbtool/user/list', reqData).then(resp=> {
          if (resp && resp.status == 200) {
            _this.customers = resp.data.content.list;
          }
        });
      });
      }
    },
    currentChange(currentChange){
      this.currentPage = currentChange;
      this.loadTaskDetails();
    },
    emptyTaskDetailData() {
      this.detail = {
          id: '',
          taskId: '',
          taskDetailName: '',
          taskDesc: '',
          taskUrl: '',
          salerId: '',
          salerName: '',
          salerTMName: '',
          customerId: '',
          customerName: '',
          taskNum: 0,
          taskUnitPrice: 0,
          taskTotalPrice: 0,
          totalCommission: 0,
          customerCommission: 0,
          status: 0,
          createTime: '',
      }; 
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    loadTaskDetails(){
      var _this = this;
      this.tableLoading = true;
      this.constructReqData({name: _this.keywords, instanceId: _this.$router.currentRoute.params.id}, this.currentPage, this.showSize).then(reqData => {
        _this.postRequest('http://127.0.0.1:8081/tbtool/task/detail/list', reqData).then(resp=> {
          _this.tableLoading = false;
          if (resp && resp.status == 200) {
            var data = resp.data;
            _this.details = data.content.list;
            _this.totalPages = data.content.pageSize;
          }
        });
      });
    },
    searchTaskDetail(){
      this.loadTaskDetails();
    },
    showAddTaskDetailView(){
      var _this = this;
      if(this.customers || this.customers.length === 0) {
        this.constructReqData({}).then(reqData => {
        _this.postRequest('http://127.0.0.1:8081/tbtool/user/list', reqData).then(resp=> {
          if (resp && resp.status == 200) {
            _this.customers = resp.data.content.list;
            this.dialogTitle = "添加任务明细";
            this.dialogVisible = true;
          }
        });
      });
      }
    },
    keywordsChange(val) {
      if (val == '') {
        this.loadTaskDetails();
      }
    },
    
    beforeFileUpload(file){
      this.fileUploadBtnText = '正在导入';
    },
    fileUploadSuccess(response, file, fileList){
      if (response) {
        this.$message({type: response.status, message: response.msg});
      }
      this.loadTaskDetails();
      this.fileUploadBtnText = '导入数据';
    },
    fileUploadError(err, file, fileList){
      this.$message({type: 'error', message: "导入失败!"});
      this.fileUploadBtnText = '导入数据';
    },
    uploadUrl() {
      return 'http://127.0.0.1:8081/tbtool/task/detail/import/' + this.$router.currentRoute.params.id + '/' + this.tokenContainer.token;
    },
    exportTaskDetails() {
      alert('此功能待完善中...');
    },
  }
}
</script>

<style>
</style>