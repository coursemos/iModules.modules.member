<?php
/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * 회원 구조체를 정의한다.
 *
 * @file /modules/member/dtos/Member.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 6. 24.
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
            $this->_status = 'DEACTIVATED';
        } else {
            $this->_member = $member;
            $this->_id = intval($member->member_id);
            $this->_email = $member->email;
            $this->_name = $member->name;
            $this->_nickname = $member->nickname;
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
        return $this->_id !== 0 || $this->_status !== 'LEAVE';
    }

    /**
     * 회원이 아닌 경우 이메일 표시정보를 수정한다.
     *
     * @param string $email 표시할 이메일주소
     * @return \modules\member\dtos\Member $member
     */
    public function setEmailPlaceHolder(string $email): \modules\member\dtos\Member
    {
        if ($this->isMember() === false) {
            $this->_email = $email;
        }
        return $this;
    }

    /**
     * 회원이 아닌 경우 닉네임 표시정보를 수정한다.
     *
     * @param string $nickname 표시할 닉네임
     * @return \modules\member\dtos\Member $member
     */
    public function setNicknamePlaceHolder(string $nickname): \modules\member\dtos\Member
    {
        if ($this->isMember() === false) {
            $this->_nickname = $nickname;
        }
        return $this;
    }

    /**
     * 회원이 아닌 경우 이메일 표시정보를 수정한다.
     *
     * @param string $photo_url 표시할 사진 URL
     * @return \modules\member\dtos\Member $member
     */
    public function setPhotoPlaceHolder(string $photo_url): \modules\member\dtos\Member
    {
        if ($this->isMember() === false) {
            $this->_photo = $photo_url;
        }
        return $this;
    }
}
