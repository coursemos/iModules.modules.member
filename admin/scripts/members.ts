/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * 회원관리화면을 구성한다.
 *
 * @file /modules/member/admin/scripts/members.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 6. 28.
 */
Admin.ready(async () => {
    const me = Admin.getModule('member') as modules.member.MemberAdmin;

    return new Admin.Panel({
        iconClass: 'xi xi-users',
        title: (await me.getText('admin.contexts.members')) as string,
        layout: 'column',
        border: false,
        scrollable: true,
        items: [
            new Admin.Tree.Panel({
                id: 'groups',
                border: [false, true, false, false],
                width: 320,
                selection: { selectable: true, keepable: true },
                expandedDepth: 1,
                topbar: [
                    new Admin.Form.Field.Search({
                        flex: 1,
                        emptyText: (await me.getText('keyword')) as string,
                        handler: async (keyword) => {
                            const groups = Admin.getComponent('groups') as Admin.Tree.Panel;
                            if (keyword.length > 0) {
                                groups.getStore().setFilter('title', keyword, 'like');
                            } else {
                                groups.getStore().resetFilter();
                            }
                        },
                    }),
                    new Admin.Button({
                        iconClass: 'mi mi-plus',
                        text: (await me.getText('admin.groups.add')) as string,
                        handler: () => {
                            me.groups.add();
                        },
                    }),
                ],
                bottombar: [
                    new Admin.Button({
                        iconClass: 'mi mi-refresh',
                        handler: (button: Admin.Button) => {
                            const grid = button.getParent().getParent() as Admin.Grid.Panel;
                            grid.getStore().reload();
                        },
                    }),
                ],
                store: new Admin.TreeStore.Ajax({
                    url: me.getProcessUrl('groups'),
                    primaryKeys: ['group_id'],
                    fields: ['group_id', 'title', { name: 'members', type: 'int' }, { name: 'sort', type: 'int' }],
                    params: {
                        mode: 'tree',
                    },
                    remoteExpand: true,
                    remoteFilter: true,
                    sorters: { sort: 'ASC' },
                }),
                columns: [
                    {
                        text: (await me.getText('admin.groups.title')) as string,
                        dataIndex: 'title',
                        sortable: 'sort',
                        flex: 1,
                    },
                    {
                        text: (await me.getText('admin.groups.members')) as string,
                        dataIndex: 'members',
                        sortable: true,
                        width: 80,
                        renderer: Admin.Tree.Renderer.Number(),
                    },
                ],
                listeners: {
                    update: (grid) => {
                        if (Admin.getContextSubTree().at(0) !== undefined && grid.getSelections().length == 0) {
                            grid.select({ group_id: Admin.getContextSubTree().at(0) });
                        } else if (grid.getSelections().length == 0) {
                            grid.select({ group_id: 'all' });
                        }
                    },
                    openItem: (record) => {
                        if (record.get('group_id') != 'all') {
                            me.groups.add(record.get('group_id'));
                        }
                    },
                    openMenu: (menu, record) => {
                        menu.setTitle(record.data.title);

                        menu.add({
                            text: me.printText('admin.groups.add_child'),
                            iconClass: 'mi mi-plus',
                            handler: () => {
                                me.groups.add(null, record.data.group_id);
                            },
                        });

                        if (record.get('group_id') != 'all') {
                            menu.add({
                                text: me.printText('admin.groups.edit'),
                                iconClass: 'xi xi-form-checkout',
                                handler: () => {
                                    me.groups.add(record.get('group_id'));
                                },
                            });

                            menu.add({
                                text: me.printText('admin.groups.delete'),
                                iconClass: 'mi mi-trash',
                                handler: () => {
                                    me.groups.delete(record.get('group_id'));
                                },
                            });
                        }
                    },
                    selectionChange: (selections) => {
                        const members = Admin.getComponent('members') as Admin.Grid.Panel;
                        const button = members.getToolbar('top').getItemAt(3);
                        if (selections.length == 1) {
                            const group_id = selections[0].get('group_id');
                            members.getStore().setParam('group_id', group_id);
                            members.getStore().loadPage(1);
                            members.enable();

                            if (Admin.getContextSubTree().at(0) !== group_id) {
                                Admin.setContextUrl(Admin.getContextUrl('/' + group_id));
                            }

                            if (group_id == 'all') {
                                button.hide();
                            } else {
                                button.show();
                            }
                        } else {
                            members.disable();
                            button.hide();
                        }
                    },
                },
            }),
            new Admin.Grid.Panel({
                id: 'members',
                border: [false, false, false, true],
                minWidth: 300,
                flex: 1,
                selection: { selectable: true, display: 'check' },
                autoLoad: false,
                disabled: true,
                topbar: [
                    new Admin.Form.Field.Search({
                        width: 200,
                        emptyText: (await me.getText('keyword')) as string,
                        handler: async (keyword) => {
                            const members = Admin.getComponent('members') as Admin.Grid.Panel;
                            if (keyword?.length > 0) {
                                members.getStore().setParam('keyword', keyword);
                            } else {
                                members.getStore().setParam('keyword', null);
                            }
                            await members.getStore().loadPage(1);
                        },
                    }),
                    '->',
                    new Admin.Button({
                        iconClass: 'mi mi-plus',
                        text: (await me.getText('admin.members.add')) as string,
                        handler: () => {
                            me.members.add();
                        },
                    }),
                    new Admin.Button({
                        iconClass: 'mi mi-group-o',
                        text: (await me.getText('admin.groups.add_member')) as string,
                        handler: () => {
                            const groups = Admin.getComponent('groups') as Admin.Grid.Panel;
                            const members = Admin.getComponent('members') as Admin.Grid.Panel;
                            const group_id = members.getStore().getParam('group_id');
                            if (group_id === null || group_id === 'all') {
                                return;
                            }

                            const title = groups.getStore().find({ group_id: group_id })?.get('title') ?? null;
                            me.groups.addMembers(group_id, title);
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
                ]),
                store: new Admin.Store.Ajax({
                    url: me.getProcessUrl('members'),
                    fields: [
                        'member_id',
                        'email',
                        'name',
                        'nickname',
                        'photo',
                        { name: 'joined_at', type: 'int' },
                        { name: 'logged_at', type: 'int' },
                    ],
                    primaryKeys: ['member_id'],
                    limit: 50,
                    remoteSort: true,
                    sorters: { joined_at: 'DESC' },
                }),
                columns: [
                    {
                        text: '#',
                        dataIndex: 'member_id',
                        width: 60,
                        textAlign: 'right',
                        sortable: true,
                    },
                    {
                        text: (await me.getText('admin.members.email')) as string,
                        dataIndex: 'email',
                        sortable: true,
                        width: 200,
                    },
                    {
                        text: (await me.getText('admin.members.name')) as string,
                        dataIndex: 'name',
                        width: 150,
                        sortable: true,
                        renderer: (value, record) => {
                            return (
                                '<i class="photo" style="background-image:url(' + record.data.photo + ')"></i>' + value
                            );
                        },
                    },
                    {
                        text: (await me.getText('admin.members.nickname')) as string,
                        dataIndex: 'nickname',
                        sortable: true,
                        width: 150,
                    },
                    {
                        text: (await me.getText('admin.members.joined_at')) as string,
                        dataIndex: 'joined_at',
                        width: 160,
                        sortable: true,
                        renderer: Admin.Grid.Renderer.DateTime(),
                    },
                    {
                        text: (await me.getText('admin.members.logged_at')) as string,
                        dataIndex: 'logged_at',
                        width: 160,
                        sortable: true,
                        renderer: Admin.Grid.Renderer.DateTime(),
                    },
                ],
                listeners: {
                    openItem: (record) => {
                        //
                    },
                    openMenu: (menu, record) => {
                        //
                    },
                },
            }),
        ],
    });
});
