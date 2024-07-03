/**********************************
 * @Author: Ronnie Zhang
 * @LastEditor: Ronnie Zhang
 * @LastEditTime: 2024-06-06 18:01:25
 * @Email: zclzone@outlook.com
 * Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 **********************************/

import { BadRequestException, Injectable } from '@nestjs/common';
import {
  AddRolePermissionsDto,
  AddRoleUsersDto,
  CreateRoleDto,
  GetRolesDto,
  QueryRoleDto,
  UpdateRoleDto,
} from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { Role } from './role.entity';
import { Permission } from '@/modules/permission/permission.entity';
import { SharedService } from '@/shared/shared.service';
import { User } from '@/modules/user/user.entity';
import { SUPER_ADMIN } from '@/common/decorators/roles.decorator';

@Injectable()
export class RoleService {
  constructor(
    private readonly sharedService: SharedService,
    @InjectRepository(Role) private roleRep: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepo: Repository<Permission>,
    @InjectRepository(User) private userRep: Repository<User>,
  ) {}
  async create(createRoleDto: CreateRoleDto) {
    const existRole = await this.roleRep.findOne({
      where: [{ name: createRoleDto.name }, { code: createRoleDto.code }],
    });
    if (existRole) throw new BadRequestException('角色已存在（角色名和角色编码不能重复）');
    const role = this.roleRep.create(createRoleDto);
    if (createRoleDto.permissionIds) {
      role.permissions = await this.permissionRepo.find({
        where: { id: In(createRoleDto.permissionIds) },
      });
    }
    return this.roleRep.save(role);
  }

  async findAll(query: GetRolesDto) {
    return this.roleRep.find({ where: query });
  }

  async findPagination(query: QueryRoleDto) {
    const pageSize = query.pageSize || 10;
    const pageNo = query.pageNo || 1;
    const [data, total] = await this.roleRep.findAndCount({
      where: {
        name: Like(`%${query.name || ''}%`),
        enable: query.enable || undefined,
      },
      relations: { permissions: true },
      order: {
        name: 'DESC',
      },
      take: pageSize,
      skip: (pageNo - 1) * pageSize,
    });
    const pageData = data.map((item) => {
      const permissionIds = item.permissions.map((p) => p.id);
      delete item.permissions;
      return { ...item, permissionIds };
    });
    return { pageData, total };
  }

  findOne(id: number) {
    return this.roleRep.findOne({ where: { id } });
  }

  async findRolePermissionsTree(code: string) {
    const role = await this.roleRep.findOne({ where: { code } });
    if (!role) throw new BadRequestException('当前角色不存在或者已删除');
    const permissions = await this.permissionRepo.find({
      where: role.code === SUPER_ADMIN ? undefined : { roles: [role] },
    });
    return this.sharedService.handleTree(permissions);
  }

  async findRolePermissions(id: number) {
    const role = await this.findOne(id);
    if (!role) throw new BadRequestException('当前角色不存在或者已删除');
    return this.permissionRepo.find({ where: { roles: [role] } });
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const role = await this.findOne(id);
    if (!role) throw new BadRequestException('角色不存在或者已删除');
    if (role.code === SUPER_ADMIN) throw new BadRequestException('不允许修改超级管理员');
    const newRole = this.roleRep.merge(role, updateRoleDto);
    if (updateRoleDto.permissionIds) {
      newRole.permissions = await this.permissionRepo.find({
        where: { id: In(updateRoleDto.permissionIds) },
      });
    }
    await this.roleRep.save(newRole);
    return true;
  }

  async remove(id: number) {
    const role = await this.roleRep.findOne({
      where: { id },
      relations: { users: true },
    });
    if (!role) throw new BadRequestException('角色不存在或者已删除');
    if (role.code === SUPER_ADMIN) throw new BadRequestException('不允许删除超级管理员');
    if (role.users?.length) throw new BadRequestException('当前角色存在已授权的用户，不允许删除！');
    await this.roleRep.remove(role);
    return true;
  }

  async addRolePermissions(dto: AddRolePermissionsDto) {
    const { permissionIds, id } = dto;
    const role = await this.roleRep.findOne({
      where: { id },
      relations: { permissions: true },
    });
    if (!role) throw new BadRequestException('角色不存在或者已删除');
    if (role.code === SUPER_ADMIN) throw new BadRequestException('无需给超级管理员授权');
    const permissions = await this.permissionRepo.find({
      where: permissionIds.map((item) => ({ id: item })),
    });
    role.permissions = role.permissions
      .filter((item) => !permissionIds.includes(item.id))
      .concat(permissions);
    await this.roleRep.save(role);
    return true;
  }

  async addRoleUsers(id: number, dto: AddRoleUsersDto) {
    const { userIds } = dto;
    const role = await this.roleRep.findOne({
      where: { id },
      relations: { users: true },
    });
    if (!role) throw new BadRequestException('角色不存在或者已删除');
    const users = await this.userRep.find({ where: { id: In(userIds) } });
    role.users = role.users.filter((item) => !userIds.includes(item.id)).concat(users);
    await this.roleRep.save(role);
    return true;
  }

  async removeRoleUsers(id: number, dto: AddRoleUsersDto) {
    const { userIds } = dto;
    const role = await this.roleRep.findOne({
      where: { id },
      relations: { users: true },
    });
    if (!role) throw new BadRequestException('角色不存在或者已删除');
    role.users = role.users.filter((item) => !userIds.includes(item.id));
    await this.roleRep.save(role);
    return true;
  }
}
