/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * OAuth관리화면을 구성한다.
 *
 * @file /modules/member/admin/scripts/contexts/oauth.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 10. 22.
 */
Admin.ready(async () => {
    const me = Admin.getModule('member');
    return new Aui.Panel({
        id: 'oauth-context',
        iconClass: 'xi xi-user-lock',
        title: await me.getText('admin.contexts.oauth'),
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
                        text: await me.getText('admin.oauth.clients.add'),
                        handler: () => {
                            me.oauth.clients.add();
                        },
                    }),
                ],
                bottombar: [
                    new Aui.Button({
                        iconClass: 'mi mi-refresh',
                        handler: (button) => {
                            const grid = button.getParent().getParent();
                            grid.getStore().reload();
                        },
                    }),
                ],
                store: new Aui.Store.Remote({
                    url: me.getProcessUrl('oauth.clients'),
                    primaryKeys: ['oauth_id'],
                    sorters: { sort: 'ASC' },
                }),
                columns: [
                    {
                        text: await me.getText('admin.oauth.clients.oauth_id'),
                        dataIndex: 'oauth_id',
                        sortable: 'sort',
                        flex: 1,
                    },
                    {
                        text: await me.getText('admin.oauth.clients.scope'),
                        dataIndex: 'scope',
                        sortable: true,
                        width: 70,
                        textAlign: 'right',
                        renderer: (value) => {
                            return Format.number(value);
                        },
                    },
                    {
                        text: await me.getText('admin.oauth.clients.tokens'),
                        dataIndex: 'tokens',
                        sortable: true,
                        width: 70,
                        textAlign: 'right',
                        renderer: (value) => {
                            return Format.number(value);
                        },
                    },
                ],
                listeners: {
                    update: (grid) => {
                        if (Admin.getContextSubUrl(0) !== null && grid.getSelections().length == 0) {
                            grid.select({ oauth_id: Admin.getContextSubUrl(0) });
                        }
                    },
                    openItem: (record) => {
                        me.oauth.clients.add(record.get('oauth_id'));
                    },
                    openMenu: (menu, record) => {
                        menu.setTitle(record.get('title'));
                        menu.add({
                            text: me.printText('admin.oauth.clients.edit'),
                            iconClass: 'xi xi-form',
                            handler: async () => {
                                me.oauth.clients.add(record.get('oauth_id'));
                                return true;
                            },
                        });
                        menu.add({
                            text: me.printText('admin.oauth.clients.delete'),
                            iconClass: 'mi mi-trash',
                            handler: async () => {
                                me.oauth.clients.delete(record.get('oauth_id'));
                                return true;
                            },
                        });
                    },
                    selectionChange: (selections) => {
                        const tokens = Aui.getComponent('tokens');
                        const button = tokens.getToolbar('top').getItemAt(3);
                        if (selections.length == 1) {
                            const oauth_id = selections[0].get('oauth_id');
                            tokens.getStore().setParam('oauth_id', oauth_id);
                            tokens.getStore().loadPage(1);
                            tokens.enable();
                            Aui.getComponent('oauth-context').properties.setUrl();
                        }
                        else {
                            tokens.disable();
                            button.hide();
                        }
                    },
                },
            }),
            new Aui.Grid.Panel({
                id: 'tokens',
                border: [false, false, false, true],
                minWidth: 300,
                flex: 1,
                selection: { selectable: true, type: 'check' },
                autoLoad: false,
                disabled: true,
                topbar: [
                    new Aui.Form.Field.Search({
                        width: 200,
                        emptyText: await me.getText('keyword'),
                        handler: async (keyword) => {
                            const tokens = Aui.getComponent('tokens');
                            if (keyword?.length > 0) {
                                tokens.getStore().setParam('keyword', keyword);
                            }
                            else {
                                tokens.getStore().setParam('keyword', null);
                            }
                            await tokens.getStore().loadPage(1);
                        },
                    }),
                ],
                bottombar: new Aui.Grid.Pagination([
                    new Aui.Button({
                        iconClass: 'mi mi-refresh',
                        handler: (button) => {
                            const grid = button.getParent().getParent();
                            grid.getStore().reload();
                        },
                    }),
                ]),
                store: new Aui.Store.Remote({
                    url: me.getProcessUrl('oauth.tokens'),
                    fields: [{ name: 'latest_access', type: 'int' }],
                    primaryKeys: ['oauth_id', 'member_id', 'user_id'],
                    limit: 50,
                    remoteSort: true,
                    sorters: { latest_access: 'DESC' },
                }),
                columns: [
                    {
                        text: '',
                        dataIndex: 'member_id',
                        width: 60,
                        textAlign: 'right',
                        sortable: true,
                    },
                    {
                        text: await me.getText('email'),
                        dataIndex: 'email',
                        width: 200,
                    },
                    {
                        text: await me.getText('name'),
                        dataIndex: 'name',
                        width: 150,
                        renderer: (value, record) => {
                            return ('<i class="photo" style="background-image:url(' +
                                record.get('photo') +
                                ')"></i>' +
                                value);
                        },
                    },
                    {
                        text: await me.getText('admin.oauth.tokens.user_id'),
                        dataIndex: 'user_id',
                        sortable: true,
                        width: 200,
                    },
                    {
                        text: await me.getText('admin.oauth.tokens.access_token'),
                        dataIndex: 'access_token',
                        width: 200,
                    },
                    {
                        text: await me.getText('admin.oauth.tokens.refresh_token'),
                        dataIndex: 'refresh_token',
                        width: 200,
                    },
                    {
                        text: await me.getText('admin.oauth.clients.scope'),
                        dataIndex: 'scope',
                        width: 70,
                        textAlign: 'right',
                    },
                    {
                        text: await me.getText('admin.oauth.tokens.latest_access'),
                        dataIndex: 'latest_access',
                        width: 160,
                        sortable: true,
                        renderer: (value) => {
                            return Format.date('Y.m.d(D) H:i', value);
                        },
                    },
                ],
                listeners: {
                    openItem: (record) => {
                        me.members.add(record.get('member_id'));
                    },
                    openMenu: (menu, record) => {
                        menu.setTitle(record.get('email'));
                        menu.add({
                            text: me.printText('admin.members.edit'),
                            iconClass: 'xi xi-form-checkout',
                            handler: async () => {
                                me.members.add(record.get('member_id'));
                                return true;
                            },
                        });
                    },
                },
            }),
        ],
        setUrl: () => {
            const clients = Aui.getComponent('clients');
            const oauth_id = clients.getSelections().at(0)?.get('oauth_id') ?? null;
            if (oauth_id !== null && Admin.getContextSubUrl(0) !== oauth_id) {
                Admin.setContextSubUrl('/' + oauth_id);
            }
        },
    });
});
