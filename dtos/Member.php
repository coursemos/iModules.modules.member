<?php
/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * 회원 구조체를 정의한다.
 *
 * @file /modules/member/dtos/Member.php
 * @author youlapark <youlapark@naddle.net>
 * @license MIT License
 * @modified 2025. 2. 4.
 */
namespace modules\member\dtos;
class Member
{
    /**
     * 회원정보
     *
     * @var ?object $_member
     */
    private ?object $_member = null;

    /**
     * @var int $_id 회원고유값
     */
    private int $_id;

    /**
     * @var string $_email 이메일
     */
    private string $_email;

    /**
     * @var string $_password 패스워드
     */
    private string $_password;

    /**
     * @var ?string $_code 회원추가코드
     */
    private ?string $_code = null;

    /**
     * @var string $_name 이름
     */
    private string $_name;

    /**
     * @var string $_nickname 닉네임
     */
    private string $_nickname;

    /**
     * @var ?string $telephone 전화번호
     */
    private ?string $_telephone = null;

    /**
     * @var ?string $cellphone 휴대전화번호
     */
    private ?string $_cellphone = null;

    /**
     * @var int $_level_id 레벨고유값
     */
    private int $_level_id;

    /**
     * @var string $_status 상태
     */
    private string $_status;

    /**
     * @var ?string $_photo 회원사진 URL
     */
    private ?string $_photo = null;

    /**
     * @var int $_logged_at 마지막로그인시각
     */
    private int $_logged_at = 0;

    /**
     * @var \modules\member\dtos\MemberGroup[] $_groups
     */
    private array $_groups;

    /**
     * @var ?object $_extras 추가정보
     */
    private ?object $_extras = null;

    /**
     * 회원 구조체를 정의한다.
     *
     * @param object $member 회원정보
     */
    public function __construct(?object $member = null)
    {
        /**
         * 비회원인 경우
         */
        if ($member === null) {
            $this->_id = 0;
            $this->_email = '';
            $this->_name = 'Unknown';
            $this->_nickname = 'Unknown';
            $this->_level_id = 0;
            $this->_status = 'DEACTIVATED';
        } else {
            $this->_member = $member;
            $this->_id = intval($member->member_id);
            $this->_email = $member->email;
            $this->_password = $member->password;
            $this->_name = $member->name;
            $this->_nickname = $member->nickname;
            $this->_telephone = $member->telephone;
            $this->_cellphone = $member->cellphone;
            $this->_level_id = $member->level_id;
            $this->_status = $member->status;
            $this->_logged_at = $member->logged_at ?? 0;
            $this->_extras = json_decode($member->extras ?? 'null');
        }
    }

    /**
     * 고유값을 가져온다.
     *
     * @return int $id
     */
    public function getId(): int
    {
        return $this->_id;
    }

    /**
     * 이메일주소를 가져온다.
     *
     * @return string $email
     */
    public function getEmail(): string
    {
        return $this->_email;
    }

    /**
     * 패스워드를 가져온다.
     *
     * @return string $password
     */
    public function getPassword(): string
    {
        return $this->_password;
    }

    /**
     * 실명을 가져온다.
     *
     * @return string $name
     */
    public function getName(): string
    {
        return $this->_name;
    }

    /**
     * 닉네임을 가져온다.
     *
     * @return string $nickname
     */
    public function getNickname(): string
    {
        return $this->_nickname;
    }

    /**
     * 전화번호를 가져온다.
     *
     * @return ?string $telephone
     */
    public function getTelephone(): ?string
    {
        return $this->_telephone;
    }

    /**
     * 휴대전화번호를 가져온다.
     *
     * @return ?string $cellphone
     */
    public function getCellphone(): ?string
    {
        return $this->_cellphone;
    }

    /**
     * 레벨을 가져온다.
     *
     * @return \modules\member\dtos\Level $level
     */
    public function getLevel(): \modules\member\dtos\Level
    {
        /**
         * @var \modules\members\Member $mMember
         */
        $mMember = \Modules::get('member');
        return $mMember->getLevel($this->_level_id);
    }

    /**
     * 사이트설정에 따라 표시될 회원이름을 가져온다.
     *
     * @param bool $is_nickcon 닉이미지가 존재할 경우 닉이미지를 가져올지 여부 (기본값 true)
     * @return string $display_name
     */
    public function getDisplayName(bool $is_nickcon = true): string
    {
        return $this->_name;
    }

    /**
     * 회원이 속한 그룹을 가져온다.
     *
     * @param bool $is_edge 가장 하위 그룹만 가져올지 여부
     * @return \modules\member\dtos\MemberGroup[] $groups
     */
    public function getGroups(bool $is_edge = false): array
    {
        if (isset($this->_groups) == false) {
            /**
             * @var \modules\members\Member $mMember
             */
            $mMember = \Modules::get('member');
            $groups = $mMember
                ->db()
                ->select()
                ->from($mMember->table('group_members'))
                ->where('member_id', $this->_id)
                ->get();
            $this->_groups = [];
            foreach ($groups as $group) {
                $this->_groups[$group->group_id] = new \modules\member\dtos\MemberGroup($group);
            }
        }

        if ($is_edge == true) {
            $parents_id = [];
            foreach ($this->_groups as $group) {
                $parent_id = $group->getGroup()->getParentId();
                if ($parent_id !== null) {
                    $parents_id[] = $parent_id;
                }
            }

            $edges = [];
            foreach ($this->_groups as $group) {
                if (in_array($group->getGroupId(), $parents_id) == false) {
                    $edges[] = $group;
                }
            }
            return $edges;
        }

        return array_values($this->_groups);
    }

    /**
     * 회원이 그룹에 속해있는지 확인한다.
     *
     * @param string $group_id
     * @return bool $is_assigned
     */
    public function isAssignedGroup(string $group_id): bool
    {
        /**
         * @var \modules\members\Member $mMember
         */
        $mMember = \Modules::get('member');
        return $mMember
            ->db()
            ->select()
            ->from($mMember->table('group_members'))
            ->where('member_id', $this->_id)
            ->where('group_id', $group_id)
            ->has();
    }

    /**
     * 회원사진을 가져온다.
     *
     * @param bool $is_full_url 도메인을 포함한 전체 URL 여부
     * @return string $_photo
     */
    public function getPhoto(bool $is_full_url = false): string
    {
        /**
         * @var \modules\member\Member $mMember
         */
        $mMember = \Modules::get('member');
        if ($this->isMember() == true) {
            return $mMember->getMemberPhoto($this->_id, $is_full_url);
        } else {
            return $this->_photo ?? $mMember->getMemberPhoto(0, $is_full_url);
        }
    }

    /**
     * 마지막 로그인 시각을 가져온다.
     *
     * @return int $logged_at
     */
    public function getLoggedAt(): int
    {
        return $this->_logged_at;
    }

    /**
     * 현재 사용자가 회원인지 확인한다.
     *
     * @return bool $is_member
     */
    public function isMember(): bool
    {
        return $this->_id !== 0 && $this->_status !== 'LEAVE';
    }

    /**
     * 회원이 아닌 경우 이메일 표시정보를 수정한다.
     *
     * @param ?string $email 표시할 이메일주소
     * @return \modules\member\dtos\Member $member
     */
    public function setEmailPlaceHolder(?string $email = null): \modules\member\dtos\Member
    {
        if ($email === null) {
            return $this;
        }

        if ($this->isMember() === false) {
            $this->_email = $email;
        }
        return $this;
    }

    /**
     * 회원이 아닌 경우 닉네임 표시정보를 수정한다.
     *
     * @param ?string $nickname 표시할 닉네임
     * @return \modules\member\dtos\Member $member
     */
    public function setNicknamePlaceHolder(?string $nickname = null): \modules\member\dtos\Member
    {
        if ($nickname === null) {
            return $this;
        }

        if ($this->isMember() === false) {
            $this->_nickname = $nickname;
        }
        return $this;
    }

    /**
     * 회원이 아닌 경우 이메일 표시정보를 수정한다.
     *
     * @param ?string $photo_url 표시할 사진 URL
     * @return \modules\member\dtos\Member $member
     */
    public function setPhotoPlaceHolder(?string $photo_url = null): \modules\member\dtos\Member
    {
        if ($photo_url === null) {
            return $this;
        }

        if ($this->isMember() === false) {
            $this->_photo = $photo_url;
        }
        return $this;
    }

    /**
     * OAuth 계정정보를 가져온다.
     *
     * @param string $oauth_id 가져올 OAuth 클라이언트 고유값
     * @return ?\modules\member\dtos\OAuthAccount $account
     */
    public function getOAuthAccount(string $oauth_id): bool|null|\modules\member\dtos\OAuthAccount
    {
        if ($this->_id == 0) {
            return false;
        }

        /**
         * @var \modules\member\Member $mMember
         */
        $mMember = \Modules::get('member');
        $client = $mMember->getOAuthClient($oauth_id);
        if ($client === null) {
            return false;
        }

        $token = $mMember
            ->db()
            ->select()
            ->from($mMember->table('oauth_tokens'))
            ->where('oauth_id', $oauth_id)
            ->where('member_id', $this->_id)
            ->getOne();
        if ($token === null) {
            return null;
        }

        $oauth = new \OAuthClient($client->getClientId(), $client->getClientSecret());
        $oauth->setScope($client->getScope(), $client->getScopeType());
        $oauth->setAccessToken($token->access_token, $token->access_token_expired_at, $token->scope);
        $oauth->setRefreshToken($token->refresh_token, $client->getTokenUrl());

        $account = new \modules\member\dtos\OAuthAccount($client, $oauth);
        return $account;
    }

    /**
     * OAuth 계정정보를 회원에게 등록한다.
     *
     * @param \modules\member\dtos\OAuthAccount $oauth OAuth 계정객체
     * @return bool $success
     */
    public function setOAuthAccount(\modules\member\dtos\OAuthAccount $account): bool
    {
        if ($this->_id == 0) {
            return false;
        }

        /**
         * @var \modules\member\Member $mMember
         */
        $mMember = \Modules::get('member');
        $insert = [
            'oauth_id' => $account->getClient()->getId(),
            'member_id' => $this->_id,
            'user_id' => $account->getId(),
            'scope' => $account->getAccessTokenScope(),
            'access_token' => $account->getAccessToken(),
            'refresh_token' => $account->getRefreshToken(),
            'access_token_expired_at' => $account->getAccessTokenExpiredAt(),
            'latest_access' => time(),
        ];

        $duplicated = ['access_token', 'scope', 'access_token', 'access_token_expired_at', 'latest_access'];
        if ($account->getRefreshToken() !== null) {
            $duplicated[] = 'refresh_token';
        }

        $results = $mMember
            ->db()
            ->insert($mMember->table('oauth_tokens'), $insert, $duplicated)
            ->execute();

        return $results->success;
    }

    /**
     * 네임태그를 가져온다.
     *
     * @param bool $menu 유저메뉴 여부
     * @param bool $is_nickcon 닉이미지 여부
     */
    public function getNameTag(bool $is_menu = true, bool $is_nickcon = true): string
    {
        $photo = \Html::element(
            'i',
            ['data-role' => 'photo', 'style' => 'background-image:url(' . $this->getPhoto() . ')'],
            '<b></b>'
        );
        $nickname = $this->getDisplayName($is_nickcon);
        $nametag = \Html::element(
            'span',
            [
                'data-module' => 'member',
                'data-role' => 'name',
                'data-member-id' => $this->_id,
                'data-menu' => $is_menu == true ? 'true' : 'false',
            ],
            $photo . '<b>' . $nickname . '</b>'
        );

        return $nametag;
    }

    /**
     * 팀 업무보기에 맞는 역할을 가져온다.
     *
     * @param string $group_id 그룹 고유값
     * @return string|array
     */
    public function getGroupPosition(string $group_id = null): string|array
    {
        /**
         * @var \modules\members\Member $mMember
         */
        $mMember = \Modules::get('member');

        if ($group_id !== null) {
            $position = $mMember->getGroup($group_id)->getPosition();
            return $position;
        }

        $groups = $this->getGroups();
        $groups_info = [];
        foreach ($groups as $group) {
            $groups_info[] = [
                'group_id' => $group->getGroupId(),
                'position' => $group->getPosition(),
                'depth' => $group->getGroup()->getDepth(),
            ];
        }

        $manager_groups = array_filter($groups_info, function ($group) {
            return $group['position'] === 'MANAGER';
        });

        if (empty($manager_groups) !== true) {
            usort($manager_groups, function ($a, $b) {
                return $a['depth'] <=> $b['depth'];
            });

            $results = $manager_groups[0];
            return [
                'group_id' => $results['group_id'],
                'position' => $results['position'],
            ];
        }

        usort($groups_info, function ($a, $b) {
            return $b['depth'] <=> $a['depth'];
        });

        $results = $groups_info[0];
        return [
            'group_id' => $results['group_id'],
            'position' => $results['position'],
        ];
    }

    /**
     * 회원이 속한 그룹에서의 포지션을 가져온다.
     *
     * @param string $group_id 포지션을 가져올 그룹 고유값
     * @param int $member_id 조회할 멤버 고유값
     * @return string $group_id
     */
    public function getGroupPositionTitle(string $group_id, string $member_id): string
    {
        /**
         * @var \modules\members\Member $mMember
         */
        $mMember = \Modules::get('member');

        $position = $mMember
            ->db()
            ->select(['position'])
            ->from($mMember->table('group_members'))
            ->where('member_id', $member_id)
            ->where('group_id', $group_id)
            ->get();

        $position = $position[0]->position;
        $position_title = $this->getGroupPositionLabels($group_id);

        if ($position == 'MANAGER') {
            $manager = $position_title['manager'];
            return $manager;
        } elseif ($position == 'MEMBER') {
            $member = $position_title['member'];
            return $member;
        }
    }

    /**
     * 그룹의 권한 명칭을 가져온다.
     *
     * @param string $group_id 조회할 그룹 고유값
     * @return array $position
     */
    public function getGroupPositionLabels(string $group_id): array
    {
        /**
         * @var \modules\members\Member $mMember
         */
        $mMember = \Modules::get('member');

        $position_title = $mMember
            ->db()
            ->select(['manager', 'member'])
            ->from($mMember->table('groups'))
            ->where('group_id', $group_id)
            ->getOne();

        if ($position_title === null) {
            return [
                'manager' => null,
                'member' => null,
            ];
        }

        $position = [
            'manager' => $position_title->manager,
            'member' => $position_title->member,
        ];

        return $position;
    }

    /**
     * 회원정보를 JSON 으로 가져온다.
     *
     * @return object $json
     */
    public function getJson(): object
    {
        $member = new \stdClass();
        $member->member_id = $this->_id;
        $member->name = $this->_name;
        $member->nickname = $this->_nickname;
        $member->level = $this->getLevel()->getJson();
        $member->groups = $this->getGroups(true);
        foreach ($member->groups as &$group) {
            $group = $group->getGroup()->getJson();
        }
        $member->photo = $this->getPhoto();

        return $member;
    }
}
