<?php
/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * 회원모듈 클래스 정의한다.
 *
 * @file /modules/member/Member.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 7. 3.
 */
namespace modules\member;
class Member extends \Module
{
    /**
     * @var \modules\member\Member[] $_members 회원정보
     */
    private static array $_members;

    /**
     * @var \modules\member\dtos\Group[] $_groups 그룹정보
     */
    private static array $_groups;

    /**
     *
     * @var int $_logged 로그인정보
     */
    private static ?int $_logged = null;

    /**
     * 모듈을 설정을 초기화한다.
     */
    public function init(): void
    {
        /**
         * 모듈 라우터를 초기화한다.
         */
        \Router::add('/members/{member_id}/{type}', '#', 'blob', [$this, 'doRoute']);

        if ($this->isLogged() === false) {
            $this->loginByAutoLogin();
        }
    }

    /**
     * 현재 로그인중인 회원고유번호를 가져온다.
     *
     * @return int $member_id 회원고유값 (로그인되어 있지 않은 경우 0)
     */
    public function getLogged(): int
    {
        if (self::$_logged === null) {
            $logged = \Request::session('MODULE_MEMBER_LOGGED');
            $logged = $logged !== null ? json_decode($logged) : null;
            self::$_logged = $logged?->member_id ?? 0;
        }

        return self::$_logged;
    }

    /**
     * 현재 사용자가 로그인중인지 확인한다.
     *
     * @return bool $is_logged
     */
    public function isLogged(): bool
    {
        return $this->getLogged() > 0;
    }

    /**
     * 그룹정보를 가져온다.
     *
     * @param string $group_id 그룹고유값
     * @return /\modules\member\dtos\Group $group
     */
    public function getGroup(string $group_id): ?\modules\member\dtos\Group
    {
        if (isset(self::$_groups[$group_id]) == true) {
            return self::$_groups[$group_id];
        }

        $group = $this->db()
            ->select()
            ->from($this->table('groups'))
            ->where('group_id', $group_id)
            ->getOne();
        if ($group == null) {
            return null;
        }

        self::$_groups[$group_id] = new \modules\member\dtos\Group($group);
        return self::$_groups[$group_id];
    }

    /**
     * 전체 회원그룹을 가져온다.
     *
     * @param string $mode 가져올 방식 (tree, list)
     * @return array $groups
     */
    public function getGroups(string $mode = 'tree'): array
    {
        $groups = $this->db()
            ->select()
            ->from($this->table('groups'))
            ->where('parent', null)
            ->get();

        $sort = 0;
        if ($mode == 'tree') {
            foreach ($groups as &$group) {
                $group->sort = $sort++;
                $group->children = $this->getGroupChildren($group, $mode, $sort);
                if (count($group->children) == 0) {
                    unset($group->children);
                }
            }

            return $groups;
        } else {
            $items = [];
            foreach ($groups as $group) {
                $group->sort = $sort++;
                $items[] = $group;
                $items = [...$items, ...$this->getGroupChildren($group, $mode, $sort)];
            }

            return $items;
        }
    }

    /**
     * 특정 그룹의 자식그룹목록을 재귀적으로 가져온다.
     *
     * @param string $mode 가져올 방식 (tree, list)
     * @param object $parent 부모그룹
     * @param int $sort 정렬순서
     * @return array $children
     */
    private function getGroupChildren(object $parent, string $mode = 'tree', int &$sort = 0): array
    {
        $children = $this->db()
            ->select()
            ->from($this->table('groups'))
            ->where('parent', $parent->group_id)
            ->get();

        if ($mode == 'tree') {
            foreach ($children as &$child) {
                $child->sort = $sort++;
                $child->children = $this->getGroupChildren($child, $mode, $sort);
                if (count($child->children) == 0) {
                    unset($child->children);
                }
            }

            return $children;
        } else {
            $items = [];
            foreach ($children as $child) {
                $child->sort = $sort++;
                $items[] = $child;
                $items = [...$items, ...$this->getGroupChildren($child, $mode, $sort)];
            }

            return $items;
        }
    }

    /**
     * 회원정보를 가져온다.
     *
     * @param ?int $member_id 회원고유값
     * @return \modules\member\dtos\Member $member
     */
    public function getMember(?int $member_id = null): \modules\member\dtos\Member
    {
        $member_id ??= $this->getLogged();
        if ($member_id !== 0 && isset(self::$_members[$member_id]) == true) {
            return self::$_members[$member_id];
        }

        if ($member_id === 0) {
            return new dto\Member();
        }

        $member = $this->db()
            ->select()
            ->from($this->table('members'))
            ->where('member_id', $member_id)
            ->getOne();

        self::$_members[$member_id] = new \modules\member\dtos\Member($member);
        return self::$_members[$member_id];
    }

    /**
     * 회원사진 URL 을 가져온다.
     *
     * @param ?int $member_id 회원고유값 (NULL 인 경우 현재 로그인한 사용자)
     * @param bool $is_full_url 도메인을 포함한 전체 URL 여부
     * @return string $url
     */
    public function getMemberPhotoUrl(?int $member_id = null, bool $is_full_url = false): string
    {
        $member_id ??= $this->getLogged();
        return \iModules::getUrl($is_full_url) . '/members/' . $member_id . '/photo.jpg';
    }

    /**
     * 이메일 및 패스워드로 로그인을 처리한다.
     *
     * @param string $email 이메일주소
     * @param string $password 패스워드
     * @param bool $auto_login 로그인 기억여부
     * @return bool|string $success 성공여부 (TRUE 가 아닌 경우 로그인에러메시지를 반환한다.)
     */
    public function login(string $email, string $password, bool $auto_login = false): bool|string
    {
        $is_locked = \Request::session('MODULE_MEMBER_LOGIN_LOCKED') ?? 0;
        if ($is_locked > time()) {
            $this->storeLog($this, 'login', 'lock', ['locked_at' => $is_locked - 600], 0);
            return $this->getErrorText('LOGIN_LOCKED', ['second' => $is_locked - time()]);
        }

        $attempts = \Request::session('MODULE_MEMBER_LOGIN_ATTEMPTS') ?? 0;
        $member = $this->db()
            ->select(['member_id', 'password'])
            ->from($this->table('members'))
            ->where('email', $email)
            ->getOne();

        $success = true;
        if ($member === null) {
            $success = $this->getErrorText('LOGIN_FAILED');
        } else {
            if (\Password::verify($password, $member->password) === false) {
                $success = $this->getErrorText('LOGIN_FAILED');
            }
        }

        if ($success === true) {
            $member_id = $member->member_id;
            $ip = \Format::ip();
            $time = time();

            \Request::setSession('MODULE_MEMBER_LOGIN_ATTEMPTS', null);
            \Request::setSession('MODULE_MEMBER_LOGIN_LOCKED', null);

            if ($auto_login === true) {
                $login_id = \UUID::v1($email);
                $this->db()
                    ->insert($this->table('logins'), [
                        'login_id' => $login_id,
                        'member_id' => $member_id,
                        'created_at' => $time,
                        'created_ip' => $ip,
                        'logged_at' => $time,
                        'logged_ip' => $ip,
                        'agent' => \Format::agent(),
                    ])
                    ->execute();

                \Request::setCookie('MODULE_MEMBER_AUTO_LOGIN_ID', \Password::encode($login_id), 60 * 60 * 24 * 365);
            }

            return $this->loginTo($member_id);
        } else {
            /**
             * 로그인 실패시 실패 기록을 남긴다.
             * @todo 환경설정
             */
            \Request::setSession('MODULE_MEMBER_LOGIN_ATTEMPTS', ++$attempts);
            if ($attempts >= 5) {
                \Request::setSession('MODULE_MEMBER_LOGIN_LOCKED', time() + 600);
            }

            $this->storeLog(
                $this,
                'login',
                'fail',
                ['email' => $email, 'password' => $password, 'attempts' => $attempts],
                $member?->member_id ?? 0
            );
        }

        return $success;
    }

    /**
     * 특정 회원으로 로그인한다.
     *
     * @param int $member_id 로그인할 회원고유값
     * @param bool $log 로그기록여부
     * @return bool $success
     */
    public function loginTo(int $member_id, bool $log = true): bool
    {
        $ip = \Format::ip();
        $time = time();

        \Request::setSession(
            'MODULE_MEMBER_LOGGED',
            json_encode([
                'member_id' => $member_id,
                'ip' => $ip,
                'time' => $time,
            ])
        );

        self::$_logged = $member_id;

        if ($log === true) {
            $this->db()
                ->update($this->table('members'), ['logged_at' => $time, 'logged_ip' => $ip])
                ->where('member_id', $member_id)
                ->execute();
            $this->storeLog($this, 'login', 'success');
        }

        return true;
    }

    /**
     * 자동로그인을 통해 로그인한다.
     */
    private function loginByAutoLogin(): void
    {
        $login_id = \Request::cookie('MODULE_MEMBER_AUTO_LOGIN_ID');
        if ($login_id === null) {
            return;
        }

        $login_id = \Password::decode($login_id);
        if ($login_id === false) {
            return;
        }

        $login = $this->db()
            ->select()
            ->from($this->table('logins'))
            ->where('login_id', $login_id)
            ->getOne();
        if ($login === null) {
            return;
        }

        $this->db()
            ->update($this->table('logins'), [
                'logged_at' => time(),
                'logged_ip' => \Format::ip(),
                'agent' => \Format::agent(),
            ])
            ->where('login_id', $login_id)
            ->execute();

        $member_id = $login->member_id;
        $ip = \Format::ip();
        $time = time();

        $this->loginTo($member_id, false);

        $this->db()
            ->update($this->table('members'), ['logged_at' => $time, 'logged_ip' => $ip])
            ->where('member_id', $member_id)
            ->execute();
        $this->storeLog($this, 'login', 'success', ['login_id' => $login_id]);
    }

    /**
     * 로그아웃한다.
     */
    public function logout(): void
    {
        if ($this->isLogged() == true) {
            $login_id = \Request::cookie('MODULE_MEMBER_AUTO_LOGIN_ID');
            if ($login_id !== null) {
                $login_id = \Password::decode($login_id);
                if ($login_id === false) {
                    $login_id = null;
                }
            }

            self::$_logged = null;
            \Request::setSession('MODULE_MEMBER_LOGGED', null);

            if ($login_id !== null) {
                $this->db()
                    ->delete($this->table('logins'))
                    ->where('login_id', $login_id)
                    ->execute();
            }
            \Request::setCookie('MODULE_MEMBER_AUTO_LOGIN_ID', null);
            $this->storeLog($this, 'logout', 'success', ['auto_login' => $login_id]);
        }
    }

    /**
     * 그룹 구성원으로 추가한다.
     *
     * @param string $group_id 구성원으로 추가할 그룹고유값
     * @param ?int $member_id 회원고유값
     * @return bool $success
     */
    public function joinGroup(string $group_id, ?int $member_id = null): bool
    {
        $member_id ??= $this->getLogged();
        if ($member_id === 0) {
            return false;
        }

        /**
         * @var \modules\member\admin\MemberAdmin $mAdmin
         */
        $mAdmin = $this->getAdmin();
        $group_ids = [];
        $time = time();
        while (true) {
            $group = $this->db()
                ->select()
                ->from($this->table('groups'))
                ->where('group_id', $group_id)
                ->getOne();
            if ($group === null) {
                if (count($group_ids) > 0) {
                    $this->db()
                        ->delete($this->table('group_members'))
                        ->where('group_id', $group_ids, 'in')
                        ->where('member_id', $member_id)
                        ->execute();

                    foreach ($group_ids as $group_id) {
                        $mAdmin->updateGroup($group_id);
                    }
                }
                return false;
            }

            $group_ids[] = $group_id;

            $joined = $this->db()
                ->select()
                ->from($this->table('group_members'))
                ->where('group_id', $group_id)
                ->where('member_id', $member_id)
                ->getOne();
            if ($joined === null) {
                $this->db()
                    ->insert($this->table('group_members'), [
                        'group_id' => $group_id,
                        'member_id' => $member_id,
                        'joined_at' => $time,
                    ])
                    ->execute();
            } else {
                $time = $joined->joined_at;
            }

            if ($group->parent === null) {
                break;
            } else {
                $group_id = $group->parent;
            }
        }

        foreach ($group_ids as $group_id) {
            $mAdmin->updateGroup($group_id);
        }

        return true;
    }

    /**
     * 로그를 기록한다.
     *
     * @param \Component $component 로그기록을 요청한 컴포넌트객체
     * @param string $log_type 로그타입
     * @param string|int $log_id 로그고유값
     * @param string $details 상세기록
     * @param ?int $member_id 회원고유값 (NULL인 경우 현재 로그인한 사용자)
     * @return bool $success
     */
    public function storeLog(
        \Component $component,
        string $log_type,
        string|int $log_id,
        string|array $details = null,
        ?int $member_id = null
    ): bool {
        $member_id ??= $this->getLogged();
        $details = is_array($details) == true ? \Format::toJson($details) : $details;

        $this->db()
            ->replace($this->table('logs'), [
                'member_id' => $member_id,
                'logged_at' => \Format::microtime(3),
                'component_type' => $component->getType(),
                'component_name' => $component->getName(),
                'log_type' => $log_type,
                'log_id' => $log_id,
                'details' => $details,
                'ip' => \Format::ip(),
                'agent' => \Format::agent(),
            ])
            ->execute();
        return $this->db()->getLastError() === null;
    }

    /**
     * 회원관련 이미지 라우팅을 처리한다.
     *
     * @param Route $route 현재경로
     * @param int $member_id 회원고유값
     * @param string $type 이미지종류
     */
    public function doRoute(\Route $route, string $member_id, string $type): void
    {
        $temp = explode('.', $type);
        $type = $temp[0];
        $extension = $temp[1];

        if (in_array($type, ['photo', 'nickcon']) === false) {
            \ErrorHandler::print($this->error('NOT_FOUND_FILE', $route->getUrl()));
        }

        if (is_file(\Configs::attachment() . '/member/' . $type . 's/' . $member_id . '.' . $extension) == true) {
            $path = \Configs::attachment() . '/member/' . $type . 's/' . $member_id . '.' . $extension;
        } else {
            $path = $this->getPath() . '/images/' . $type . '.' . $extension;
        }

        \iModules::session_stop();

        \Header::type($extension);
        \Header::length(filesize($path));
        \Header::cache(3600);

        readfile($path);
        exit();
    }

    /**
     * 특수한 에러코드의 경우 에러데이터를 현재 클래스에서 처리하여 에러클래스로 전달한다.
     *
     * @param string $code 에러코드
     * @param ?string $message 에러메시지
     * @param ?object $details 에러와 관련된 추가정보
     * @return \ErrorData $error
     */
    public function error(string $code, ?string $message = null, ?object $details = null): \ErrorData
    {
        switch ($code) {
            /**
             * 관리자 컨텍스트 URL 이 이미 정의된 경우
             */
            case 'LOGIN_FAILED':
                $error = \ErrorHandler::data();
                $error->message = $this->getErrorText('LOGIN_FAILED');
                return $error;

            default:
                return parent::error($code, $message, $details);
        }
    }

    /**
     * 회원모듈이 설치된 이후 최고관리자(회원고유값=1) 정보를 변경한다.
     *
     * @param string $previous 이전설치버전 (NULL 인 경우 신규설치)
     * @param object $configs 모듈설정
     * @return bool $success 설치성공여부
     */
    public function install(string $previous = null, object $configs = null): bool
    {
        $success = parent::install($previous);
        if ($success == true) {
            \File::createDirectory(\Configs::attachment() . '/member/photos');
            \File::createDirectory(\Configs::attachment() . '/member/nickcons');

            if (\Request::get('token') !== null) {
                $token = json_decode(\Password::decode(\Request::get('token')));
                if (
                    $token !== null &&
                    isset($token->admin_email) == true &&
                    isset($token->admin_password) == true &&
                    isset($token->admin_name) == true
                ) {
                    $this->db()
                        ->insert(
                            $this->table('members'),
                            [
                                'member_id' => 1,
                                'email' => $token->admin_email,
                                'name' => $token->admin_name,
                                'nickname' => $token->admin_name,
                                'password' => \Password::hash($token->admin_password),
                                'joined_at' => time(),
                            ],
                            ['email', 'password', 'name', 'nickname']
                        )
                        ->execute();
                }
            }
        }

        return $success;
    }
}
