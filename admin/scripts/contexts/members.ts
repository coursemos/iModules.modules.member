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
    const me = Admin.getModule('member') as modules.member.admin.Member;

    return new Aui.Tab.Panel({
        id: 'members-context',
        iconClass: 'xi xi-users',
        title: (await me.getText('admin.contexts.members')) as string,
        border: false,
        layout: 'fit',
        items: [
            new Aui.Panel({
                id: 'lists',
                iconClass: 'xi xi-users',
                title: (await me.getText('admin.members.title')) as string,
                layout: 'column',
                border: false,
                items: [
                    new Aui.Tab.Panel({
                        id: 'types',
                        border: [false, true, false, false],
                        width: 320,
                        tabPosition: 'hidden',
                        items: [
                            new Aui.Tree.Panel({
                                id: 'groups',
                                border: false,
                                layout: 'fit',
                                selection: { selectable: true, keepable: true },
                                autoLoad: false,
                                topbar: [
                                    new Aui.Form.Field.Search({
                                        flex: 1,
                                        emptyText: (await me.getText('keyword')) as string,
                                        handler: async (keyword) => {
                                            const groups = Aui.getComponent('groups') as Aui.Tree.Panel;
                                            if (keyword.length > 0) {
                                                groups.getStore().setFilter('title', keyword, 'like');
                                            } else {
                                                groups.getStore().resetFilter();
                                            }
                                        },
                                    }),
                                    new Aui.Button({
                                        iconClass: 'mi mi-plus',
                                        text: (await me.getText('admin.groups.add')) as string,
                                        handler: () => {
                                            me.groups.add();
                                        },
                                    }),
                                ],
                                store: new Aui.TreeStore.Ajax({
                                    url: me.getProcessUrl('groups'),
                                    primaryKeys: ['group_id'],
                                    fields: [
                                        'group_id',
                                        'title',
                                        { name: 'members', type: 'int' },
                                        { name: 'sort', type: 'int' },
                                    ],
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
                                        renderer: Aui.Tree.Renderer.Number(),
                                    },
                                ],
                                listeners: {
                                    update: (grid) => {
                                        if (
                                            Admin.getContextSubUrl(0) == 'lists' &&
                                            Admin.getContextSubUrl(1) == 'groups'
                                        ) {
                                            if (
                                                grid.getSelections().length == 0 &&
                                                Admin.getContextSubUrl(2) !== null
                                            ) {
                                                grid.select({ group_id: Admin.getContextSubUrl(2) });
                                            } else if (grid.getSelections().length == 0) {
                                                grid.select({ group_id: 'all' });
                                            }
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
                                        const members = Aui.getComponent('members') as Aui.Grid.Panel;
                                        const button = members.getToolbar('top').getItemAt(3);
                                        if (selections.length == 1) {
                                            const group_id = selections[0].get('group_id');
                                            members.getStore().setParam('group_id', group_id);
                                            members.getStore().loadPage(1);
                                            members.enable();

                                            Aui.getComponent('members-context').properties.setUrl();

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
                            new Aui.Grid.Panel({
                                id: 'levels',
                                border: false,
                                layout: 'fit',
                                selection: { selectable: true, keepable: true },
                                autoLoad: false,
                                topbar: [
                                    new Aui.Form.Field.Search({
                                        flex: 1,
                                        emptyText: (await me.getText('keyword')) as string,
                                        handler: async (keyword) => {
                                            const groups = Aui.getComponent('groups') as Aui.Tree.Panel;
                                            if (keyword.length > 0) {
                                                groups.getStore().setFilter('title', keyword, 'like');
                                            } else {
                                                groups.getStore().resetFilter();
                                            }
                                        },
                                    }),
                                    new Aui.Button({
                                        iconClass: 'mi mi-plus',
                                        text: (await me.getText('admin.levels.add')) as string,
                                        handler: () => {
                                            me.groups.add();
                                        },
                                    }),
                                ],
                                store: new Aui.Store.Ajax({
                                    url: me.getProcessUrl('levels'),
                                    primaryKeys: ['level'],
                                    fields: [
                                        'level',
                                        'title',
                                        { name: 'members', type: 'int' },
                                        { name: 'sort', type: 'int' },
                                    ],
                                    sorters: { level: 'ASC' },
                                }),
                                columns: [
                                    {
                                        text: (await me.getText('admin.levels.title')) as string,
                                        dataIndex: 'title',
                                        sortable: 'sort',
                                        flex: 1,
                                    },
                                    {
                                        text: (await me.getText('admin.levels.members')) as string,
                                        dataIndex: 'members',
                                        sortable: true,
                                        width: 80,
                                        renderer: Aui.Grid.Renderer.Number(),
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
                        bottombar: [
                            new Aui.Button({
                                iconClass: 'mi mi-refresh',
                                handler: (button) => {
                                    const tab = button.getParent().getParent() as Aui.Tab.Panel;
                                    const type = tab.getItemAt(0) as Aui.Tree.Panel | Aui.Grid.Panel;
                                    type.getStore().reload();
                                },
                            }),
                            '->',
                            new Aui.SegmentedButton({
                                items: [
                                    new Aui.Button({
                                        text: me.printText('admin.members.lists.group'),
                                        value: 'groups',
                                        handler: (button) => {
                                            const tab = button.getParent().getParent().getParent() as Aui.Tab.Panel;
                                            tab.active(0);
                                        },
                                    }),
                                    new Aui.Button({
                                        text: me.printText('admin.members.lists.level'),
                                        value: 'levels',
                                        handler: (button) => {
                                            const tab = button.getParent().getParent().getParent() as Aui.Tab.Panel;
                                            tab.active(1);
                                        },
                                    }),
                                ],
                            }),
                        ],
                        listeners: {
                            render: (tab) => {
                                if (Admin.getContextSubUrl(0) == 'lists') {
                                    const type = Admin.getContextSubUrl(1);
                                    if (type !== null) {
                                        tab.active(type);
                                    }
                                }
                            },
                            active: (panel, tab) => {
                                const buttons = tab.getToolbar('bottom').getItemAt(2) as Aui.SegmentedButton;
                                buttons.setValue('groups');
                                if (panel.getId() == 'groups') {
                                    buttons.setValue('groups');

                                    const groups = panel as Aui.Tree.Panel;
                                    if (groups.getStore().isLoaded() == false) {
                                        groups.getStore().load();
                                    }
                                } else {
                                    buttons.setValue('levels');
                                }

                                Aui.getComponent('members-context').properties.setUrl();
                            },
                        },
                    }),
                    new Aui.Grid.Panel({
                        id: 'members',
                        border: [false, false, false, true],
                        minWidth: 300,
                        flex: 1,
                        selection: { selectable: true, display: 'check' },
                        autoLoad: false,
                        disabled: true,
                        topbar: [
                            new Aui.Form.Field.Search({
                                width: 200,
                                emptyText: (await me.getText('keyword')) as string,
                                handler: async (keyword) => {
                                    const members = Aui.getComponent('members') as Aui.Grid.Panel;
                                    if (keyword?.length > 0) {
                                        members.getStore().setParam('keyword', keyword);
                                    } else {
                                        members.getStore().setParam('keyword', null);
                                    }
                                    await members.getStore().loadPage(1);
                                },
                            }),
                            '->',
                            new Aui.Button({
                                iconClass: 'mi mi-plus',
                                text: (await me.getText('admin.members.add')) as string,
                                handler: () => {
                                    me.members.add();
                                },
                            }),
                            new Aui.Button({
                                iconClass: 'mi mi-group-o',
                                text: (await me.getText('admin.groups.add_member')) as string,
                                handler: () => {
                                    const groups = Aui.getComponent('groups') as Aui.Grid.Panel;
                                    const members = Aui.getComponent('members') as Aui.Grid.Panel;
                                    const group_id = members.getStore().getParam('group_id');
                                    if (group_id === null || group_id === 'all') {
                                        return;
                                    }

                                    const title = groups.getStore().find({ group_id: group_id })?.get('title') ?? null;
                                    me.groups.addMembers(group_id, title);
                                },
                            }),
                        ],
                        bottombar: new Aui.Grid.Pagination([
                            new Aui.Button({
                                iconClass: 'mi mi-refresh',
                                handler: (button) => {
                                    const grid = button.getParent().getParent() as Aui.Grid.Panel;
                                    grid.getStore().reload();
                                },
                            }),
                        ]),
                        store: new Aui.Store.Ajax({
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
                                        '<i class="photo" style="background-image:url(' +
                                        record.data.photo +
                                        ')"></i>' +
                                        value
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
                                renderer: Aui.Grid.Renderer.DateTime(),
                            },
                            {
                                text: (await me.getText('admin.members.logged_at')) as string,
                                dataIndex: 'logged_at',
                                width: 160,
                                sortable: true,
                                renderer: Aui.Grid.Renderer.DateTime(),
                            },
                        ],
                        listeners: {
                            openItem: (record) => {},
                            openMenu: (menu, record) => {},
                        },
                    }),
                ],
            }),
            new Aui.Grid.Panel({
                id: 'logs',
                iconClass: 'xi xi-time-back',
                title: (await me.getText('admin.logs.title')) as string,
                border: false,
                layout: 'fit',
                autoLoad: false,
                topbar: [
                    new Aui.Form.Field.Search({
                        width: 200,
                        emptyText: (await me.getText('keyword')) as string,
                    }),
                ],
                bottombar: new Aui.Grid.Pagination([
                    new Aui.Button({
                        iconClass: 'mi mi-refresh',
                        handler: (button) => {
                            const grid = button.getParent().getParent() as Aui.Grid.Panel;
                            grid.getStore().reload();
                        },
                    }),
                ]),
                columns: [
                    {
                        text: (await me.getText('admin.administrators.logs.time')) as string,
                        dataIndex: 'time',
                        width: 180,
                        textAlign: 'center',
                        sortable: true,
                        renderer: Aui.Grid.Renderer.DateTime('YYYY.MM.DD(dd) HH:mm:ss'),
                    },
                    {
                        text: (await me.getText('admin.administrators.logs.name')) as string,
                        dataIndex: 'name',
                        width: 150,
                        sortable: true,
                        renderer: (value, record) => {
                            return (
                                '<i class="photo" style="background-image:url(' +
                                record.get('photo') +
                                ')"></i>' +
                                value
                            );
                        },
                    },
                    {
                        text: (await me.getText('admin.members.email')) as string,
                        dataIndex: 'email',
                        sortable: true,
                        width: 200,
                    },
                    {
                        text: (await me.getText('admin.logs.component')) as string,
                        dataIndex: 'component',
                        minWidth: 250,
                        flex: 1,
                    },
                    {
                        text: (await me.getText('admin.logs.message')) as string,
                        dataIndex: 'log_type',
                        width: 100,
                    },
                    {
                        text: 'IP',
                        dataIndex: 'ip',
                        width: 110,
                    },
                ],
                store: new Aui.Store.Ajax({
                    url: me.getProcessUrl('logs'),
                    primaryKeys: ['time', 'member_id'],
                    fields: [{ name: 'time', type: 'float' }],
                    limit: 50,
                    remoteSort: true,
                    sorters: { time: 'DESC' },
                }),
                listeners: {
                    openItem: (record) => {},
                    openMenu: (menu, record) => {},
                },
            }),
        ],
        listeners: {
            render: (tab) => {
                const panel = Admin.getContextSubUrl(0);
                if (panel !== null) {
                    tab.active(panel);
                }
            },
            active: (panel) => {
                Aui.getComponent('members-context').properties.setUrl();

                if (panel.getId() == 'logs') {
                    const logs = Aui.getComponent('logs') as Aui.Grid.Panel;
                    if (logs.getStore().isLoaded() == false) {
                        logs.getStore().load();
                    }
                }
            },
        },
        setUrl: () => {
            const context = Aui.getComponent('members-context') as Aui.Tab.Panel;
            if (Admin.getContextSubUrl(0) !== context.getActiveTab().getId()) {
                Admin.setContextSubUrl('/' + context.getActiveTab().getId());
            }

            if (Admin.getContextSubUrl(0) == 'lists') {
                const types = Aui.getComponent('types') as Aui.Tab.Panel;

                if (Admin.getContextSubUrl(1) !== types.getActiveTab().getId()) {
                    Admin.setContextSubUrl('/lists/' + types.getActiveTab().getId());
                }

                if (Admin.getContextSubUrl(1) == 'groups') {
                    const groups = Aui.getComponent('groups') as Aui.Tree.Panel;
                    const group_id = groups.getSelections().at(0)?.get('group_id') ?? null;
                    if (group_id !== null && Admin.getContextSubUrl(1) !== group_id) {
                        Admin.setContextSubUrl('/lists/groups/' + group_id);
                    }
                }
            }
        },
    });
});
