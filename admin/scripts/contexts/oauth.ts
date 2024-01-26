/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * OAuth관리화면을 구성한다.
 *
 * @file /modules/member/admin/scripts/contexts/oauth.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 26.
 */
Admin.ready(async () => {
    const me = Admin.getModule('member') as modules.member.admin.Member;

    return new Aui.Panel({
        iconClass: 'xi xi-user-lock',
        title: (await me.getText('admin.contexts.oauth')) as string,
        layout: 'column',
        border: false,
        scrollable: true,
        items: [
            new Aui.Grid.Panel({
                id: 'clients',
                border: [false, true, false, false],
                width: 320,
                selection: { selectable: true, keepable: true },
                expandedDepth: 1,
                topbar: [
                    new Aui.Button({
                        iconClass: 'mi mi-plus',
                        text: (await me.getText('admin.oauth.clients.add')) as string,
                        handler: () => {
                            me.oauth.clients.add();
                        },
                    }),
                ],
                bottombar: [
                    new Aui.Button({
                        iconClass: 'mi mi-refresh',
                        handler: (button) => {
                            const grid = button.getParent().getParent() as Aui.Grid.Panel;
                            grid.getStore().reload();
                        },
                    }),
                ],
                store: new Aui.Store.Ajax({
                    url: me.getProcessUrl('oauth.clients'),
                    primaryKeys: ['oauth_id'],
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
                        text: (await me.getText('admin.oauth.clients.scope')) as string,
                        dataIndex: 'scope',
                        sortable: true,
                        width: 80,
                        renderer: Aui.Grid.Renderer.Number(),
                    },
                    {
                        text: (await me.getText('admin.groups.members')) as string,
                        dataIndex: 'members',
                        sortable: true,
                        width: 80,
                        renderer: Aui.Grid.Renderer.Number(),
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
                        me.oauth.clients.add(record.get('oauth_id'));
                    },
                    openMenu: (menu, record) => {
                        menu.setTitle(record.data.title);

                        menu.add({
                            text: me.printText('admin.oauth.clients.edit'),
                            iconClass: 'xi xi-form',
                            handler: () => {
                                me.oauth.clients.add(record.get('oauth_id'));
                            },
                        });

                        menu.add({
                            text: me.printText('admin.oauth.clients.delete'),
                            iconClass: 'mi mi-trash',
                            handler: () => {
                                me.oauth.clients.delete(record.get('oauth_id'));
                            },
                        });
                    },
                    selectionChange: (selections) => {
                        const members = Aui.getComponent('members') as Aui.Grid.Panel;
                        const button = members.getToolbar('top').getItemAt(3);
                        if (selections.length == 1) {
                            const group_id = selections[0].get('group_id');
                            members.getStore().setParam('group_id', group_id);
                            members.getStore().loadPage(1);
                            members.enable();

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
    });
});
