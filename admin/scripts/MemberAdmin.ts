/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자 UI 이벤트를 관리하는 클래스를 정의한다.
 *
 * @file /modules/member/admin/scripts/MemberAdmin.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 6. 28.
 */
namespace modules {
    export namespace member {
        export class MemberAdmin extends Admin.Interface {
            groups = {
                /**
                 * 그룹을 추가한다.
                 *
                 * @param {string} group_id - 그룹정보를 수정할 경우 수정할 group_id
                 * @param {string} parent - 상위그룹 group_id
                 */
                add: (group_id: string = null, parent: string = null): void => {
                    new Admin.Window({
                        title: this.printText('admin.groups.' + (group_id === null ? 'add' : 'edit')),
                        width: 500,
                        modal: true,
                        resizable: false,
                        items: [
                            new Admin.Form.Panel({
                                border: false,
                                layout: 'fit',
                                items: [
                                    new Admin.Form.Field.Select({
                                        name: 'parent',
                                        store: new Admin.TreeStore.Ajax({
                                            url: Modules.get('member').getProcessUrl('groups'),
                                            primaryKeys: ['group_id'],
                                            params: {
                                                mode: 'tree',
                                            },
                                            remoteExpand: true,
                                            sorters: { sort: 'ASC' },
                                        }),
                                        listField: 'title',
                                        displayField: 'title',
                                        valueField: 'group_id',
                                        search: true,
                                        emptyText: this.printText('admin.groups.parent'),
                                        value: parent,
                                    }),
                                    new Admin.Form.Field.Text({
                                        name: 'title',
                                        emptyText: this.printText('admin.groups.title'),
                                    }),
                                ],
                            }),
                        ],
                        buttons: [
                            new Admin.Button({
                                text: this.printText('buttons.cancel'),
                                tabIndex: -1,
                                handler: (button) => {
                                    const window = button.getParent() as Admin.Window;
                                    window.close();
                                },
                            }),
                            new Admin.Button({
                                text: this.printText('buttons.ok'),
                                buttonClass: 'confirm',
                                handler: async (button) => {
                                    const window = button.getParent() as Admin.Window;
                                    const form = button.getParent().getItemAt(0) as Admin.Form.Panel;
                                    const results = await form.submit({
                                        url: this.getProcessUrl('group'),
                                        params: { group_id: group_id },
                                    });

                                    if (results.success == true) {
                                        Admin.Message.show({
                                            title: (await Admin.getText('info')) as string,
                                            message: (await Admin.getText('actions.saved')) as string,
                                            icon: Admin.Message.INFO,
                                            buttons: Admin.Message.OK,
                                            handler: async () => {
                                                const groups = Admin.getComponent('groups') as Admin.Tree.Panel;
                                                await groups.getStore().reload();
                                                await groups.getStore().getParents({ group_id: results.group_id });
                                                groups.select({ group_id: results.group_id });
                                                window.close();
                                                Admin.Message.close();
                                            },
                                        });
                                    }
                                },
                            }),
                        ],
                        listeners: {
                            show: async (window) => {
                                const form = window.getItemAt(0) as Admin.Form.Panel;

                                if (group_id !== null) {
                                    const results = await form.load({
                                        url: this.getProcessUrl('group'),
                                        params: { group_id: group_id },
                                    });

                                    if (results.success == true) {
                                    } else {
                                        window.close();
                                    }
                                }
                            },
                        },
                    }).show();
                },
                /**
                 * 그룹구성원을 추가한다.
                 *
                 * @param {string} group_id - 구성원을 추가할 그룹아이디
                 * @param {string} title - 구성원을 추가할 그룹명
                 */
                addMembers: (group_id: string, title: string = null): void => {
                    new Admin.Window({
                        title: this.printText('admin.groups.add_member') + (title ? ' (' + title + ')' : ''),
                        width: 800,
                        height: 600,
                        modal: true,
                        resizable: false,
                        items: [
                            new Admin.Grid.Panel({
                                border: [false, true, false, false],
                                layout: 'fit',
                                width: 400,
                                selection: { selectable: true, display: 'check', keepable: true },
                                autoLoad: true,
                                freeze: 1,
                                topbar: [
                                    new Admin.Form.Field.Search({
                                        width: 200,
                                        emptyText: this.printText('keyword'),
                                        handler: async (keyword, field) => {
                                            const grid = field.getParent().getParent() as Admin.Grid.Panel;
                                            if (keyword?.length > 0) {
                                                grid.getStore().setParam('keyword', keyword);
                                            } else {
                                                grid.getStore().setParam('keyword', null);
                                            }
                                            await grid.getStore().loadPage(1);
                                        },
                                    }),
                                ],
                                bottombar: new Admin.Grid.Pagination([
                                    new Admin.Button({
                                        iconClass: 'mi mi-refresh',
                                        handler: (button: Admin.Button) => {
                                            const grid = button.getParent().getParent() as Admin.Grid.Panel;
                                            grid.getStore().reload();
                                        },
                                    }),
                                    '->',
                                    new Admin.Form.Field.Display({
                                        value: this.printText('text.selected_members', { count: '0' }),
                                    }),
                                ]),
                                columns: [
                                    {
                                        text: '#',
                                        dataIndex: 'member_id',
                                        width: 60,
                                        textAlign: 'right',
                                        sortable: true,
                                    },
                                    {
                                        text: this.printText('admin.members.email'),
                                        dataIndex: 'email',
                                        minWidth: 200,
                                    },
                                    {
                                        text: this.printText('admin.members.name'),
                                        dataIndex: 'name',
                                        width: 150,
                                        renderer: (value, record) => {
                                            return (
                                                '<i class="photo" style="background-image:url(' +
                                                record.data.photo +
                                                ')"></i>' +
                                                value
                                            );
                                        },
                                    },
                                    {
                                        text: this.printText('admin.members.nickname'),
                                        dataIndex: 'nickname',
                                        width: 150,
                                    },
                                    {
                                        text: this.printText('admin.members.joined_at'),
                                        dataIndex: 'joined_at',
                                        width: 160,
                                        sortable: true,
                                        renderer: Admin.Grid.Renderer.DateTime(),
                                    },
                                ],
                                store: new Admin.Store.Ajax({
                                    url: Admin.getProcessUrl('module', 'member', 'members'),
                                    fields: [
                                        { name: 'member_id', type: 'int' },
                                        'email',
                                        'name',
                                        'nickname',
                                        'photo',
                                        'joined_at',
                                        'logged_at',
                                    ],
                                    primaryKeys: ['member_id'],
                                    limit: 50,
                                    remoteSort: true,
                                    sorters: { joined_at: 'DESC' },
                                    remoteFilter: true,
                                    filters: { status: 'ACTIVATED' },
                                }),
                                listeners: {
                                    selectionChange: (selections, grid) => {
                                        const display = grid
                                            .getToolbar('bottom')
                                            .getItemAt(-1) as Admin.Form.Field.Display;
                                        display.setValue(
                                            this.printText('text.selected_members', {
                                                count: selections.length.toString(),
                                            })
                                        );
                                    },
                                },
                            }),
                        ],
                        buttons: [
                            new Admin.Button({
                                text: this.printText('buttons.cancel'),
                                tabIndex: -1,
                                handler: (button) => {
                                    const window = button.getParent() as Admin.Window;
                                    window.close();
                                },
                            }),
                            new Admin.Button({
                                text: this.printText('buttons.ok'),
                                buttonClass: 'confirm',
                                handler: async (button) => {
                                    const window = button.getParent() as Admin.Window;
                                    const grid = window.getItemAt(0) as Admin.Grid.Panel;

                                    const member_ids: number[] = grid.getSelections().map((selected) => {
                                        return selected.get('member_id');
                                    });

                                    if (member_ids.length == 0) {
                                        Admin.Message.show({
                                            title: (await Admin.getText('info')) as string,
                                            message: (await Admin.getText(
                                                'admin.actions.unselected_members'
                                            )) as string,
                                            icon: Admin.Message.INFO,
                                            buttons: Admin.Message.OK,
                                        });
                                        return;
                                    }

                                    const results = await Admin.Ajax.post(this.getProcessUrl('group.members'), {
                                        group_id: group_id,
                                        member_ids: member_ids,
                                    });

                                    if (results.success == true) {
                                        Admin.Message.show({
                                            title: (await Admin.getText('info')) as string,
                                            message: (await Admin.getText('actions.saved')) as string,
                                            icon: Admin.Message.INFO,
                                            buttons: Admin.Message.OK,
                                            handler: async () => {
                                                const groups = Admin.getComponent('groups') as Admin.Grid.Panel;
                                                await groups.getStore().reload();
                                                const members = Admin.getComponent('members') as Admin.Grid.Panel;
                                                await members.getStore().reload();
                                                window.close();
                                                Admin.Message.close();
                                            },
                                        });
                                    }
                                },
                            }),
                        ],
                    }).show();
                },
                /**
                 * 그룹을 삭제한다.
                 *
                 * @param {string} group_id
                 */
                delete: (group_id: string): void => {
                    //
                },
            };

            members = {
                /**
                 * 회원을 추가한다.
                 */
                add: (): void => {
                    new Admin.Window({
                        title: this.printText('admin.members.add'),
                        width: 500,
                        modal: true,
                        resizable: false,
                        items: [
                            new Admin.Form.Panel({
                                layout: 'fit',
                                border: false,
                                items: [
                                    new Admin.Form.Field.Text({
                                        label: this.printText('admin.members.email'),
                                        name: 'email',
                                        inputType: 'email',
                                        allowBlank: false,
                                    }),
                                    new Admin.Form.Field.Text({
                                        label: this.printText('admin.members.password'),
                                        name: 'password',
                                        allowBlank: false,
                                    }),
                                    new Admin.Form.Field.Text({
                                        label: this.printText('admin.members.name'),
                                        name: 'name',
                                        allowBlank: false,
                                    }),
                                    new Admin.Form.Field.Text({
                                        label: this.printText('admin.members.nickname'),
                                        name: 'nickname',
                                        allowBlank: false,
                                    }),
                                    new Admin.Form.Field.Select({
                                        label: this.printText('admin.members.groups'),
                                        name: 'group_ids',
                                        store: new Admin.TreeStore.Ajax({
                                            url: this.getProcessUrl('groups'),
                                        }),
                                        multiple: true,
                                        valueField: 'group_id',
                                        displayField: 'title',
                                        search: true,
                                        emptyText: this.printText('admin.members.nogroups'),
                                        helpText: this.printText('admin.members.groups_help'),
                                    }),
                                ],
                            }),
                        ],
                        buttons: [
                            new Admin.Button({
                                text: this.printText('buttons.cancel'),
                                tabIndex: -1,
                                handler: (button) => {
                                    const window = button.getParent() as Admin.Window;
                                    window.close();
                                },
                            }),
                            new Admin.Button({
                                text: this.printText('buttons.ok'),
                                buttonClass: 'confirm',
                                handler: async (button) => {
                                    const window = button.getParent() as Admin.Window;
                                    const form = button.getParent().getItemAt(0) as Admin.Form.Panel;
                                    const results = await form.submit({
                                        url: this.getProcessUrl('member'),
                                    });

                                    if (results.success == true) {
                                        Admin.Message.show({
                                            title: (await Admin.getText('info')) as string,
                                            message: (await Admin.getText('actions.saved')) as string,
                                            icon: Admin.Message.INFO,
                                            buttons: Admin.Message.OK,
                                            handler: async () => {
                                                const groups = Admin.getComponent('groups') as Admin.Tree.Panel;
                                                await groups.getStore().reload();
                                                const members = Admin.getComponent('members') as Admin.Grid.Panel;
                                                await members.getStore().loadPage(1);
                                                window.close();
                                                Admin.Message.close();
                                            },
                                        });
                                    }
                                },
                            }),
                        ],
                    }).show();
                },
            };
        }
    }
}
