<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleDialogVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="roleList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  @close="removeRightById(scope.row, item1.id)"
                  closable
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环嵌套渲染二级权限 -->
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      @close="removeRightById(scope.row, item2.id)"
                      closable
                      type="success"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      @close="removeRightById(scope.row, item3.id)"
                      closable
                      type="warning"
                      v-for="(item3, i3) in item2.children"
                      :key="item3.id"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showEditRoleDialog(scope.row.id)"
              >编辑</el-button
            >
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeRoleById(scope.row.id)"
              >删除</el-button
            >
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 树形控件 -->
      <el-tree
        :default-checked-keys="defkeys"
        default-expand-all
        node-key="id"
        :data="rightsList"
        :props="treeProps"
        show-checkbox
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRightDialogVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRoleDialogVisible"
      width="50%"
      @close="addRoleDialogClosed"
    >
      <!-- 内容主题区域 -->
      <el-form
        :model="addRoleForm"
        :rules="addRoleFormRules"
        ref="addRoleFormRef"
        label-width="70px"
      >
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色的对话框 -->
    <el-dialog
      title="编辑角色"
      :visible.sync="editRoleDialogVisible"
      width="50%"
    >
      <!-- 编辑角色的主题区域 -->
      <el-form
        :model="editRoleForm"
        :rules="editRoleFormRules"
        ref="editRoleFormRef"
        label-width="70px"
      >
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有角色列表数据
      roleList: [],
      // 控制分配权限对话框的显示与隐藏
      setRightDialogVisible: false,
      // 所有权限的数据
      rightsList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点id值数组
      defkeys: [],
      // 控制添加角色对话框是否显示
      addRoleDialogVisible: false,
      // 添加角色的表单数据
      addRoleForm: {
        RoleName: '',
        roleDesc: ''
      },
      // 添加角色表单的验证规则
      addRoleFormRules: {
        roleName: [
          {
            required: true,
            message: '请输入角色名',
            trigger: 'blur'
          }
        ]
      },
      // 控制编辑角色对话框是否显示
      editRoleDialogVisible: false,
      // 查询到的角色信息对象
      editRoleForm: {},
      //编辑角色表单的验证规则
      editRoleFormRules: {
        roleName: [
          {
            required: true,
            message: '请输入角色名',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 获取所有角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status != 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.roleList = res.data
    },
    // 根据id删除对应权限
    async removeRightById(role, rightId) {
      // 弹框提示用户是否要删除
      const confirmResult = await this.$confirm(
        '此操作将永久删除该权限, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除')
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败')
      }
      // 为了避免删除权限之后页面整体渲染导致页面被合起来，使用下面这种方法
      // this.getRolesList()
      role.children = res.data
    },
    // 展示分配权限的对话框
    async showSetRightDialog(role) {
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status != 200) {
        return this.$message.error('获取权限数据失败！')
      }
      // 获取到的权限数据保存到data中
      this.rightsList = res.data
      // 递归获取三级节点id
      this.getLeafKeys(role, this.defkeys)
      this.setRightDialogVisible = true
    },
    // 通过递归的形式获取角色下所有三级权限的id，保存到defkeys数组中
    getLeafKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 监听分配权限对话框的关闭事件
    setRightDialogClosed() {
      this.defkeys = []
    },
    // 监听添加角色关闭对话框事件
    addRoleDialogClosed() {
      this.$refs.addRoleFormRef.resetFields()
    },
    // 添加角色
    addRole() {
      this.$refs.addRoleFormRef.validate(async valid => {
        if (!valid) return
        // 发起添加角色的网络请求
        const { data: res } = await this.$http.post('roles', this.addRoleForm)
        if (res.meta.status != 201) {
          return this.$message.error('创建角色失败')
        }
        this.$message.success('添加用户成功')
        this.addRoleDialogVisible = false
        // 重新获取角色列表
        this.getRolesList()
      })
    },
    //展示编辑角色的对话框
    async showEditRoleDialog(id) {
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status != 200) {
        return this.$message.error('查询角色信息失败')
      }
      this.editRoleForm = res.data
      this.editRoleDialogVisible = true
    },
    // 修改角色信息提交
    editRoleInfo() {
      this.$refs.editRoleFormRef.validate(async valid => {
        if (!valid) return
        //发起修改角色的请求
        const {data:res} = await this.$http.put('roles/' + this.editRoleForm.roleId, {
          roleName: this.editRoleForm.roleName,
          roleDesc: this.editRoleForm.roleDesc
        })
        if (res.meta.status != 200){
          return this.$message.error('更新角色失败')
        }
        this.editRoleDialogVisible = false
        this.getRolesList()
        this.$message.success('更新角色信息成功')
      })
    },
    // 删除角色
    async removeRoleById(id){
      // 弹框询问是否删除
      const confirmResult = await this.$confirm(
        '此操作将永久删除该角色, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 用户确认删除返回值是字符串confirm
      // 用户取消删除返回值是字符串concel
      if (confirmResult != 'confirm') {
        return this.$message.info('已取消删除')
      }
      const {data:res} = await this.$http.delete('roles/'+id)
      if (res.meta.status != 200) {
        return this.$message.error('删除角色失败')
      }
      this.getRolesList()
      this.$message.success('删除角色成功')
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
